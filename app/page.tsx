import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PublicPromptCard } from "@/components/prompts/PublicPromptCard";

export const dynamic = "force-dynamic";

const SECTION_SIZE = 15;

export default async function HomePage() {
  let session = null;
  try {
    session = await auth();
  } catch (e) {
    console.error("[HomePage] auth error:", e);
  }
  const userId = session?.user?.id ?? null;

  let dbError: string | null = null;

  async function fetchPrompts() {
    return Promise.all([
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
  }

  const fetchResult = await (async () => {
    try {
      return await fetchPrompts();
    } catch (e) {
      console.error("[HomePage] Prisma error:", e);
      dbError = e instanceof Error ? e.message : "Ошибка базы данных";
      return [[], []] as Awaited<ReturnType<typeof fetchPrompts>>; // fallback on error
    }
  })();

  const [recentRaw, popularRaw] = fetchResult;

  let likedPromptIds = new Set<string>();
  if (userId && !dbError) {
    try {
      const allIds = [...new Set([...recentRaw.map((p) => p.id), ...popularRaw.map((p) => p.id)])];
      if (allIds.length > 0) {
        const likes = await prisma.like.findMany({
          where: { userId, promptId: { in: allIds } },
          select: { promptId: true },
        });
        likedPromptIds = new Set(likes.map((l) => l.promptId));
      }
    } catch {
      // likedByMe будет false для всех
    }
  }

  const toCardData = (p: { id: string; title: string; content: string; createdAt: Date; owner?: { name: string | null }; _count: { likes: number } }) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    createdAt: p.createdAt,
    ownerName: p.owner?.name ?? null,
    likesCount: p._count.likes,
    likedByMe: likedPromptIds.has(p.id),
  });

  const recentPrompts = dbError ? [] : recentRaw.map(toCardData);
  const popularPrompts = dbError ? [] : popularRaw.map(toCardData);

  return (
    <div className="container mx-auto px-4 py-8">
      {dbError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
          Не удалось загрузить промты. Проверьте DATABASE_URL и наличие таблицы Like (npm run db:like).
        </div>
      )}
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
