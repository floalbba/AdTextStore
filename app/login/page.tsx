import { auth } from "@/lib/auth";
import { signIn } from "next-auth/react";
import LoginButton from "./LoginButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

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
      <p style={{ marginBottom: "2rem", color: "#666" }}>
        Войдите, чтобы продолжить
      </p>
      <LoginButton callbackUrl={callbackUrl || "/dashboard"} />
    </main>
  );
}
