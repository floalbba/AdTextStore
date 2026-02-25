"use client";

import { useState, useEffect, useCallback } from "react";

type DbType = "local" | "production";

export default function ViewDbPage() {
  const [db, setDb] = useState<DbType>("production");
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [data, setData] = useState<{
    columns: string[];
    rows: Record<string, unknown>[];
    total: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [columns, setColumns] = useState<
    { name: string; type: string; nullable: boolean }[]
  >([]);
  const [modal, setModal] = useState<
    | { type: "create" }
    | { type: "edit"; row: Record<string, unknown>; idColumn: string; idValue: string }
    | null
  >(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/view-db/tables?db=${db}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Ошибка");
      setTables(json.tables);
      setSelectedTable(null);
      setData(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const openTable = useCallback(
    async (table: string) => {
      setLoading(true);
      setError(null);
      try {
        const [dataRes, colsRes] = await Promise.all([
          fetch(
            `/api/view-db/data?db=${db}&table=${encodeURIComponent(table)}&page=${page}&pageSize=${pageSize}`
          ),
          fetch(
            `/api/view-db/columns?db=${db}&table=${encodeURIComponent(table)}`
          ),
        ]);
        const dataJson = await dataRes.json();
        const colsJson = await colsRes.json();
        if (!dataRes.ok) throw new Error(dataJson.error || "Ошибка данных");
        if (!colsRes.ok) throw new Error(colsJson.error || "Ошибка колонок");
        setData(dataJson);
        setColumns(colsJson.columns);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    },
    [db, page, pageSize]
  );

  useEffect(() => {
    if (selectedTable) openTable(selectedTable);
  }, [selectedTable, page, openTable]);

  const refreshData = () => {
    if (selectedTable) openTable(selectedTable);
  };

  const handleCreate = () => {
    setFormData({});
    setModal({ type: "create" });
  };

  const handleEdit = (row: Record<string, unknown>, idColumn: string) => {
    const idValue = row[idColumn];
    if (idValue == null) return;
    const fd: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      if (v instanceof Date) fd[k] = v.toISOString().slice(0, 19);
      else fd[k] = String(v ?? "");
    }
    setFormData(fd);
    setModal({
      type: "edit",
      row,
      idColumn,
      idValue: String(idValue),
    });
  };

  const handleDelete = async (row: Record<string, unknown>, idColumn: string) => {
    const idValue = row[idColumn];
    if (idValue == null || !confirm("Удалить запись?")) return;
    try {
      const res = await fetch("/api/view-db/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          db,
          table: selectedTable,
          idColumn,
          idValue: String(idValue),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Ошибка");
      refreshData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка удаления");
    }
  };

  const submitForm = async () => {
    if (!selectedTable || !modal) return;
    const payload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(formData)) {
      if (v === "") continue;
      const col = columns.find((c) => c.name === k);
      if (col?.type?.includes("int")) payload[k] = parseInt(v, 10);
      else payload[k] = v;
    }

    try {
      if (modal.type === "create") {
        const res = await fetch("/api/view-db/crud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            db,
            table: selectedTable,
            data: payload,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Ошибка");
      } else {
        const { idColumn, idValue } = modal;
        delete payload[idColumn];
        const res = await fetch("/api/view-db/crud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update",
            db,
            table: selectedTable,
            idColumn,
            idValue,
            data: payload,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Ошибка");
      }
      setModal(null);
      refreshData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка сохранения");
    }
  };

  const idColumn =
    data?.columns.find((c) => c.toLowerCase() === "id") ?? data?.columns[0] ?? "id";
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <main style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <h1>View DB</h1>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>
          БД:{" "}
          <select
            value={db}
            onChange={(e) => setDb(e.target.value as DbType)}
            style={{ padding: "0.5rem 1rem", fontSize: 16 }}
          >
            <option value="production">Рабочая (production)</option>
            <option value="local">Локальная</option>
          </select>
        </label>
      </div>

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "#fee",
            color: "#c00",
            marginBottom: "1rem",
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <section style={{ minWidth: 200 }}>
          <h2>Таблицы</h2>
          {loading && !selectedTable ? (
            <p>Загрузка...</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {tables.map((t) => (
                <li key={t} style={{ marginBottom: "0.5rem" }}>
                  <button
                    onClick={() => {
                      setSelectedTable(t);
                      setPage(1);
                      setData(null);
                    }}
                    style={{
                      padding: "0.5rem 1rem",
                      width: "100%",
                      textAlign: "left",
                      background: selectedTable === t ? "#e0f0ff" : "#f5f5f5",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={{ flex: 1, minWidth: 400, overflow: "auto" }}>
          {selectedTable && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2>{selectedTable}</h2>
                <button
                  onClick={handleCreate}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  + Создать
                </button>
              </div>

              {loading ? (
                <p>Загрузка данных...</p>
              ) : data ? (
                <>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 14,
                      }}
                    >
                      <thead>
                        <tr style={{ background: "#f0f0f0" }}>
                          {data.columns.map((c) => (
                            <th
                              key={c}
                              style={{
                                padding: "0.5rem",
                                border: "1px solid #ddd",
                                textAlign: "left",
                              }}
                            >
                              {c}
                            </th>
                          ))}
                          <th
                            style={{
                              padding: "0.5rem",
                              border: "1px solid #ddd",
                              width: 120,
                            }}
                          >
                            Действия
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.rows.map((row, i) => (
                          <tr key={i}>
                            {data.columns.map((c) => (
                              <td
                                key={c}
                                style={{
                                  padding: "0.5rem",
                                  border: "1px solid #ddd",
                                  maxWidth: 200,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {row[c] != null
                                  ? String(
                                      row[c] instanceof Date
                                        ? (row[c] as Date).toLocaleString("ru-RU")
                                        : row[c]
                                    )
                                  : "—"}
                              </td>
                            ))}
                            <td
                              style={{
                                padding: "0.5rem",
                                border: "1px solid #ddd",
                              }}
                            >
                              <button
                                onClick={() => handleEdit(row, idColumn)}
                                style={{
                                  marginRight: "0.5rem",
                                  padding: "0.25rem 0.5rem",
                                  fontSize: 12,
                                  cursor: "pointer",
                                }}
                              >
                                Изменить
                              </button>
                              <button
                                onClick={() => handleDelete(row, idColumn)}
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  fontSize: 12,
                                  background: "#f44336",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 2,
                                  cursor: "pointer",
                                }}
                              >
                                Удалить
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div
                    style={{
                      marginTop: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <span>
                      Записей: {data.total} | Страница {page} из {totalPages || 1}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      style={{ padding: "0.25rem 0.75rem", cursor: "pointer" }}
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                      style={{ padding: "0.25rem 0.75rem", cursor: "pointer" }}
                    >
                      →
                    </button>
                  </div>
                </>
              ) : null}
            </>
          )}
        </section>
      </div>

      {modal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setModal(null)}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: 8,
              maxWidth: 500,
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {modal.type === "create" ? "Создать запись" : "Изменить запись"}
            </h3>
            {columns
              .filter(
                (c) =>
                  modal.type === "create" ||
                  (c.name !== modal.idColumn && c.name !== "createdAt")
              )
              .map((c) => (
                <div key={c.name} style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.25rem" }}>
                    {c.name} ({c.type})
                  </label>
                  <input
                    type={
                      c.type.includes("int")
                        ? "number"
                        : c.type.includes("timestamp")
                          ? "datetime-local"
                          : "text"
                    }
                    value={formData[c.name] ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [c.name]: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      boxSizing: "border-box",
                    }}
                    readOnly={modal.type === "edit" && c.name === "id"}
                  />
                </div>
              ))}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button
                onClick={submitForm}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Сохранить
              </button>
              <button
                onClick={() => setModal(null)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#999",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
