"use client";

import Link from "next/link";
import { MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/dashboard/LikeButton";
import { cn } from "@/lib/utils";

const PREVIEW_LENGTH = 120;

export interface PublicPromptCardProps {
  prompt: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    ownerName: string | null;
    likesCount: number;
    likedByMe: boolean;
  };
  isAuthenticated: boolean;
}

export function PublicPromptCard({ prompt, isAuthenticated }: PublicPromptCardProps) {
  const preview =
    prompt.content.length > PREVIEW_LENGTH
      ? prompt.content.slice(0, PREVIEW_LENGTH) + "…"
      : prompt.content;

  const dateStr = new Date(prompt.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      )}
    >
      <div className="flex gap-3">
        <div className="shrink-0 mt-0.5">
          <MessageSquare className="h-5 w-5 text-slate-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 truncate">{prompt.title}</h3>
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">{preview}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>{prompt.ownerName || "Аноним"}</span>
            <span>{dateStr}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <LikeButton
            promptId={prompt.id}
            initialLiked={prompt.likedByMe}
            initialCount={prompt.likesCount}
            isAuthenticated={isAuthenticated}
          />
        </div>
        <Link href={`/prompts/${prompt.id}`}>
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="h-4 w-4" />
            Открыть
          </Button>
        </Link>
      </div>
    </article>
  );
}
