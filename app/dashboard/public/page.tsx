import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PromptsList } from "@/components/dashboard/PromptsList";
import { DashboardPublicClient } from "@/components/dashboard/DashboardPublicClient";

const PAGE_SIZE = 10;

export default async function DashboardPublicPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const { q = "", page = "1" } = await searchParams;
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

  const [prompts, total] = await Promise.all([
    prisma.prompt.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.prompt.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900">Личный кабинет</h1>
      <h2 className="mt-2 text-lg font-medium text-slate-600">Публичные промты</h2>

      <div className="mt-6">
        <Suspense fallback={<div className="h-9 w-full max-w-xs rounded-md border border-slate-200 bg-slate-50" />}>
          <DashboardPublicClient searchQuery={q} />
        </Suspense>
      </div>

      <div className="mt-6">
        <PromptsList
          prompts={prompts}
          currentUserId={userId}
          showDelete={true}
          emptyMessage="Публичных промтов пока нет"
        />
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {pageNum > 1 && (
            <a
              href={`/dashboard/public?q=${encodeURIComponent(q)}&page=${pageNum - 1}`}
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
              href={`/dashboard/public?q=${encodeURIComponent(q)}&page=${pageNum + 1}`}
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
