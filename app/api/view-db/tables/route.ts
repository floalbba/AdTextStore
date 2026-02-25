import { NextRequest } from "next/server";
import { getTables } from "@/lib/view-db";

export async function GET(request: NextRequest) {
  const db = (request.nextUrl.searchParams.get("db") || "production") as
    | "local"
    | "production";
  if (db !== "local" && db !== "production") {
    return Response.json({ error: "Неверный параметр db" }, { status: 400 });
  }
  try {
    const tables = await getTables(db);
    return Response.json({ tables });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Ошибка БД" },
      { status: 500 }
    );
  }
}
