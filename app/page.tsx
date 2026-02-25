import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PublicPromptCard } from "@/components/prompts/PublicPromptCard";

export const dynamic = "force-dynamic";

const SECTION_SIZE = 15;

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const [recentRaw, popularRaw] = await Promise.all([
    prisma.prompt.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      take: SECTION_SIZE,
      include: {
        _count: { select: { likes: true } },
        owner: { select: { name: true } },
      },
    }),
    prisma.prompt.findMany({
      where: { isPublic: true },
      orderBy: { likes: { _count: "desc" } },
      take: SECTION_SIZE,
      include: {
        _count: { select: { likes: true } },
        owner: { select: { name: true } },
      },
    }),
  ]);

  let likedPromptIds = new Set<string>();
  if (userId) {
    const allIds = [...new Set([...recentRaw.map((p) => p.id), ...popularRaw.map((p) => p.id)])];
    const likes = await prisma.like.findMany({
      where: { userId, promptId: { in: allIds } },
      select: { promptId: true },
    });
    likedPromptIds = new Set(likes.map((l) => l.promptId));
  }

  const toCardData = (
    p: (typeof recentRaw)[0]
  ) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    createdAt: p.createdAt,
    ownerName: p.owner?.name ?? null,
    likesCount: p._count.likes,
    likedByMe: likedPromptIds.has(p.id),
  });

  const recentPrompts = recentRaw.map(toCardData);
  const popularPrompts = popularRaw.map(toCardData);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <section className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-8 md:p-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Хранилище промтов для рекламы
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          Создавайте, сохраняйте и делитесь промтами. Находите готовые решения от сообщества.
        </p>
        <div className="mt-6">
          {session?.user ? (
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Добавить промт
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link href="/login?callbackUrl=/dashboard">
                <Button size="lg" className="gap-2">
                  Добавить промт
                </Button>
              </Link>
              <p className="text-sm text-slate-500">Войдите, чтобы добавлять промты</p>
            </div>
          )}
        </div>
      </section>

      {/* Новые */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Новые</h2>
        {recentPrompts.length === 0 ? (
          <p className="text-slate-500 py-8 text-center">Публичных промтов пока нет</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {recentPrompts.map((p) => (
              <li key={p.id}>
                <PublicPromptCard prompt={p} isAuthenticated={!!userId} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Популярные */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Популярные</h2>
        {popularPrompts.length === 0 ? (
          <p className="text-slate-500 py-8 text-center">Публичных промтов пока нет</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {popularPrompts.map((p) => (
              <li key={p.id}>
                <PublicPromptCard prompt={p} isAuthenticated={!!userId} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
