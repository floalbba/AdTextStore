import { NextRequest } from "next/server";
import {
  createRow,
  updateRow,
  deleteRow,
} from "@/lib/view-db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, db, table, data, idColumn, idValue } = body;

  if (db !== "local" && db !== "production") {
    return Response.json({ error: "Неверный параметр db" }, { status: 400 });
  }
  if (!table || typeof table !== "string") {
    return Response.json({ error: "Не указана таблица" }, { status: 400 });
  }

  try {
    if (action === "create") {
      if (!data || typeof data !== "object") {
        return Response.json({ error: "Нет данных" }, { status: 400 });
      }
      await createRow(db, table, data);
      return Response.json({ ok: true });
    }

    if (action === "update") {
      if (!data || typeof data !== "object" || !idColumn || idValue === undefined) {
        return Response.json(
          { error: "Нужны data, idColumn, idValue" },
          { status: 400 }
        );
      }
      await updateRow(db, table, idColumn, String(idValue), data);
      return Response.json({ ok: true });
    }

    if (action === "delete") {
      if (!idColumn || idValue === undefined) {
        return Response.json(
          { error: "Нужны idColumn и idValue" },
          { status: 400 }
        );
      }
      await deleteRow(db, table, idColumn, String(idValue));
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Неизвестное действие" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Ошибка БД" },
      { status: 500 }
    );
  }
}
