import { NextRequest } from "next/server";
import { getTableData } from "@/lib/view-db";

export async function GET(request: NextRequest) {
  const db = (request.nextUrl.searchParams.get("db") || "production") as
    | "local"
    | "production";
  const table = request.nextUrl.searchParams.get("table");
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(
    request.nextUrl.searchParams.get("pageSize") || "10",
    10
  );

  if (db !== "local" && db !== "production") {
    return Response.json({ error: "Неверный параметр db" }, { status: 400 });
  }
  if (!table) {
    return Response.json({ error: "Не указана таблица" }, { status: 400 });
  }

  try {
    const data = await getTableData(db, table, page, Math.min(pageSize, 100));
    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Ошибка БД" },
      { status: 500 }
    );
  }
}
