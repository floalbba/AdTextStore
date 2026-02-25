import { NextRequest } from "next/server";
import { getTableColumns } from "@/lib/view-db";

export async function GET(request: NextRequest) {
  const db = (request.nextUrl.searchParams.get("db") || "production") as
    | "local"
    | "production";
  const table = request.nextUrl.searchParams.get("table");

  if (db !== "local" && db !== "production") {
    return Response.json({ error: "Неверный параметр db" }, { status: 400 });
  }
  if (!table) {
    return Response.json({ error: "Не указана таблица" }, { status: 400 });
  }

  try {
    const columns = await getTableColumns(db, table);
    return Response.json({ columns });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Ошибка БД" },
      { status: 500 }
    );
  }
}
