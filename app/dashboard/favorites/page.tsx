import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PromptsList } from "@/components/dashboard/PromptsList";
import { PromptDialogTrigger } from "@/components/dashboard/PromptDialogTrigger";

export default async function DashboardFavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const prompts = await prisma.prompt.findMany({
    where: { ownerId: session.user.id, isFavorite: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900">Личный кабинет</h1>
      <h2 className="mt-2 text-lg font-medium text-slate-600">Избранное</h2>

      <div className="mt-6 flex justify-end">
        <PromptDialogTrigger mode="create" />
      </div>

      <div className="mt-6">
        <PromptsList
          prompts={prompts}
          currentUserId={session.user.id}
          showDelete={true}
          emptyMessage="В избранном пока ничего нет — добавьте промты звёздочкой"
        />
      </div>
    </div>
  );
}
