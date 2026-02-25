import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PromptsList } from "@/components/dashboard/PromptsList";
import { DashboardPublicClient } from "@/components/dashboard/DashboardPublicClient";

const PAGE_SIZE = 10;
const SORT_OPTIONS = ["popular", "recent"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

function isValidSort(s: string | undefined): s is SortOption {
  return s === "popular" || s === "recent";
}

export default async function DashboardPublicPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const { q = "", page = "1", sort: sortParam } = await searchParams;
  const sort: SortOption = isValidSort(sortParam) ? sortParam : "recent";
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const skip = (pageNum - 1) * PAGE_SIZE;

  const where = {
    isPublic: true,
    ...(q.trim()
      ? {
          OR: [
            { title: { contains: q.trim(), mode: "insensitive" as const } },
            { content: { contains: q.trim(), mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "popular"
      ? { likes: { _count: "desc" as const } }
      : { createdAt: "desc" as const };

  const [promptsRaw, total] = await Promise.all([
    prisma.prompt.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      include: {
        _count: { select: { likes: true } },
        likes: userId
          ? { where: { userId }, select: { id: true } }
          : { where: { userId: "none" }, select: { id: true } },
      },
    }),
    prisma.prompt.count({ where }),
  ]).catch((e) => {
    console.error("[DashboardPublic] Prisma error:", e);
    throw e;
  });

  const prompts = promptsRaw.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    isPublic: p.isPublic,
    isFavorite: p.isFavorite,
    ownerId: p.ownerId,
    likesCount: p._count.likes,
    likedByMe: p.likes.length > 0,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (page > 1) params.set("page", String(page));
    if (sort !== "recent") params.set("sort", sort);
    return `/dashboard/public${params.toString() ? `?${params}` : ""}`;
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900">Личный кабинет</h1>
      <h2 className="mt-2 text-lg font-medium text-slate-600">Публичные промты</h2>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Suspense fallback={<div className="h-9 w-full max-w-xs rounded-md border border-slate-200 bg-slate-50" />}>
          <DashboardPublicClient searchQuery={q} sort={sort} />
        </Suspense>
      </div>

      <div className="mt-6">
        <PromptsList
          prompts={prompts}
          currentUserId={userId}
          showDelete={true}
          showLike={true}
          emptyMessage="Публичных промтов пока нет"
        />
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {pageNum > 1 && (
            <a
              href={buildUrl(pageNum - 1)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              ← Назад
            </a>
          )}
          <span className="text-sm text-slate-500">
            Страница {pageNum} из {totalPages}
          </span>
          {pageNum < totalPages && (
            <a
              href={buildUrl(pageNum + 1)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Вперёд →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
