import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <h1>ProStore</h1>
      <p>
        {session?.user ? (
          <>
            <a href="/dashboard">Личный кабинет</a>
            {" · "}
            <a href="/my-prompts">Мои промты</a>
          </>
        ) : (
          <a href="/login">Войти через Google</a>
        )}
        {" · "}
        <a href="/view-db">View DB</a>
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
