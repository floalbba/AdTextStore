import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyPromptsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        { email: session.user.email ?? undefined },
      ],
    },
    include: {
      prompts: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Мои промты</h1>
        <Link
          href="/api/auth/signout"
          style={{
            padding: "0.5rem 1rem",
            background: "#666",
            color: "white",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Выйти
        </Link>
      </div>
      {!user || user.prompts.length === 0 ? (
        <p>У вас пока нет промтов.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {user.prompts.map((p) => (
            <li
              key={p.id}
              style={{
                padding: "1rem",
                border: "1px solid #eee",
                borderRadius: 8,
                marginBottom: "0.5rem",
              }}
            >
              <strong>{p.title}</strong>
              <p style={{ margin: "0.5rem 0 0", color: "#666", fontSize: 14 }}>
                {p.content.slice(0, 100)}
                {p.content.length > 100 ? "…" : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
