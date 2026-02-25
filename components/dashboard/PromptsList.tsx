import { PromptCard } from "./PromptCard";

interface Prompt {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  isFavorite: boolean;
  ownerId: string;
}

interface PromptsListProps {
  prompts: Prompt[];
  currentUserId: string;
  showDelete?: boolean;
  emptyMessage?: string;
}

export function PromptsList({
  prompts,
  currentUserId,
  showDelete = true,
  emptyMessage = "У вас пока нет промтов — создайте первый",
}: PromptsListProps) {
  if (prompts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {prompts.map((prompt) => (
        <li key={prompt.id}>
          <PromptCard
            prompt={prompt}
            currentUserId={currentUserId}
            showDelete={showDelete}
          />
        </li>
      ))}
    </ul>
  );
}
