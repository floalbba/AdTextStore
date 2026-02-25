import { Pool } from "pg";

const TABLE_WHITELIST = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function getPool(db: "local" | "production"): Pool {
  const url =
    db === "local"
      ? process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL
      : process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL не задан");
  return new Pool({ connectionString: url });
}

function validateTable(table: string): void {
  if (!TABLE_WHITELIST.test(table)) {
    throw new Error("Недопустимое имя таблицы");
  }
}

export async function getTables(db: "local" | "production"): Promise<string[]> {
  const pool = getPool(db);
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name
    `);
    return result.rows.map((r) => r.table_name);
  } finally {
    await pool.end();
  }
}

export async function getTableData(
  db: "local" | "production",
  table: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  columns: string[];
  rows: Record<string, unknown>[];
  total: number;
}> {
  validateTable(table);
  const pool = getPool(db);
  try {
    const offset = (page - 1) * pageSize;

    const countResult = await pool.query(
      `SELECT COUNT(*)::int FROM "${table}"`
    );
    const total = countResult.rows[0].count;

    const dataResult = await pool.query(
      `SELECT * FROM "${table}" ORDER BY 1 LIMIT $1 OFFSET $2`,
      [pageSize, offset]
    );
    const columns = dataResult.rows[0]
      ? Object.keys(dataResult.rows[0])
      : [];
    const rows = dataResult.rows;

    return { columns, rows, total };
  } finally {
    await pool.end();
  }
}

export async function getTableColumns(
  db: "local" | "production",
  table: string
): Promise<{ name: string; type: string; nullable: boolean }[]> {
  validateTable(table);
  const pool = getPool(db);
  try {
    const result = await pool.query(
      `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `,
      [table]
    );
    return result.rows.map((r) => ({
      name: r.column_name,
      type: r.data_type,
      nullable: r.is_nullable === "YES",
    }));
  } finally {
    await pool.end();
  }
}

export async function createRow(
  db: "local" | "production",
  table: string,
  data: Record<string, unknown>
): Promise<void> {
  validateTable(table);
  const pool = getPool(db);
  try {
    const cols = Object.keys(data).filter((k) => TABLE_WHITELIST.test(k));
    const columns = cols.map((c) => `"${c}"`).join(", ");
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const values = cols.map((c) => data[c]);
    await pool.query(
      `INSERT INTO "${table}" (${columns}) VALUES (${placeholders})`,
      values
    );
  } finally {
    await pool.end();
  }
}

export async function updateRow(
  db: "local" | "production",
  table: string,
  idColumn: string,
  idValue: string,
  data: Record<string, unknown>
): Promise<void> {
  validateTable(table);
  if (!TABLE_WHITELIST.test(idColumn)) throw new Error("Недопустимое имя колонки");
  const pool = getPool(db);
  try {
    const cols = Object.keys(data).filter((k) => TABLE_WHITELIST.test(k));
    const setClause = cols.map((c, i) => `"${c}" = $${i + 1}`).join(", ");
    const values = [...cols.map((c) => data[c]), idValue];
    await pool.query(
      `UPDATE "${table}" SET ${setClause} WHERE "${idColumn}" = $${cols.length + 1}`,
      values
    );
  } finally {
    await pool.end();
  }
}

export async function deleteRow(
  db: "local" | "production",
  table: string,
  idColumn: string,
  idValue: string
): Promise<void> {
  validateTable(table);
  if (!TABLE_WHITELIST.test(idColumn)) throw new Error("Недопустимое имя колонки");
  const pool = getPool(db);
  try {
    await pool.query(
      `DELETE FROM "${table}" WHERE "${idColumn}" = $1`,
      [idValue]
    );
  } finally {
    await pool.end();
  }
}
