import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/dashboard/LikeButton";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const prompt = await prisma.prompt.findUnique({
    where: { id, isPublic: true },
    include: {
      _count: { select: { likes: true } },
      owner: { select: { name: true } },
    },
  });

  if (!prompt) {
    notFound();
  }

  let likedByMe = false;
  if (userId) {
    const like = await prisma.like.findUnique({
      where: {
        userId_promptId: { userId, promptId: id },
      },
    });
    likedByMe = !!like;
  }

  const dateStr = new Date(prompt.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        На главную
      </Link>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{prompt.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span>{prompt.owner?.name || "Аноним"}</span>
          <span>{dateStr}</span>
        </div>

        <div className="mt-6 prose prose-slate max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-slate-700 bg-slate-50 p-4 rounded-lg overflow-x-auto">
            {prompt.content}
          </pre>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <LikeButton
            promptId={prompt.id}
            initialLiked={likedByMe}
            initialCount={prompt._count.likes}
            isAuthenticated={!!userId}
          />
          <Link href="/">
            <Button variant="outline" size="sm">
              К каталогу
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
