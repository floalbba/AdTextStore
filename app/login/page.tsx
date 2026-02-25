import { auth } from "@/lib/auth";
import { signIn } from "next-auth/react";
import LoginButton from "./LoginButton";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "Ошибка конфигурации сервера. Проверь AUTH_SETUP.md",
  AccessDenied: "Доступ запрещён",
  Verification: "Ссылка для входа устарела или уже использована",
  Default: "Произошла ошибка при входе",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;

  if (session?.user) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <p>Вы уже вошли как {session.user.email}</p>
        <a href={callbackUrl || "/dashboard"}>Перейти в личный кабинет</a>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ marginBottom: "2rem" }}>ProStore</h1>
      {error && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            background: "#fee",
            color: "#c00",
            borderRadius: 8,
            maxWidth: 400,
            textAlign: "center",
          }}
        >
          {ERROR_MESSAGES[error] || ERROR_MESSAGES.Default}
        </div>
      )}
      <p style={{ marginBottom: "2rem", color: "#666" }}>
        Войдите, чтобы продолжить
      </p>
      <LoginButton callbackUrl={callbackUrl || "/dashboard"} />
    </main>
  );
}
