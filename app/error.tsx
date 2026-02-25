"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h2>Что-то пошло не так</h2>
      <p style={{ color: "#666", marginBottom: "1rem" }}>
        {error.message || "Серверная ошибка"}
      </p>
      <p style={{ fontSize: 14, color: "#999" }}>
        Проверь переменные окружения (DATABASE_URL, AUTH_SECRET) и логи Vercel.
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: "#333",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Попробовать снова
      </button>
    </main>
  );
}
