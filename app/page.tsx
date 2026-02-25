import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <h1>AdTextStore</h1>
      <p>
        <a href="/view-db">View DB</a> — просмотр и редактирование БД
      </p>
      <p>Заметки из PostgreSQL (Neon):</p>
      {notes.length === 0 ? (
        <p>Нет заметок. Запусти: <code>npx prisma db seed</code></p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <strong>{note.title}</strong>
              <span> — {note.createdAt.toLocaleString("ru-RU")}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
