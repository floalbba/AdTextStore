import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Личный кабинет</h1>
        <Link
          href="/api/auth/signout"
          style={{
            padding: "0.5rem 1rem",
            background: "#666",
            color: "white",
            border: "none",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Выйти
        </Link>
      </div>
      <p>Добро пожаловать, {session.user.name || session.user.email}!</p>
      {session.user.image && (
        <img
          src={session.user.image}
          alt=""
          width={48}
          height={48}
          style={{ borderRadius: "50%", marginTop: "1rem" }}
        />
      )}
    </main>
  );
}
