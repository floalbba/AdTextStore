"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body style={{ padding: "2rem", fontFamily: "system-ui" }}>
        <h1>Ошибка приложения</h1>
        <p>{error.message}</p>
        <p style={{ fontSize: 14, color: "#666" }}>
          Проверь: DATABASE_URL, AUTH_SECRET в Vercel → Project Settings → Environment Variables
        </p>
        <button onClick={reset} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
          Обновить
        </button>
      </body>
    </html>
  );
}
