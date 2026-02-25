"use client";

import { useState } from "react";
import {
  MessageSquare,
  Star,
  Pencil,
  Trash2,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deletePrompt,
  togglePublic,
  toggleFavorite,
} from "@/actions/prompts";
import { PromptDialog } from "./PromptDialog";
import { cn } from "@/lib/utils";

const PREVIEW_LENGTH = 120;

export interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    content: string;
    isPublic: boolean;
    isFavorite: boolean;
    ownerId: string;
  };
  currentUserId: string;
  showDelete?: boolean;
}

export function PromptCard({
  prompt,
  currentUserId,
  showDelete = true,
}: PromptCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwner = prompt.ownerId === currentUserId;
  const preview =
    prompt.content.length > PREVIEW_LENGTH
      ? prompt.content.slice(0, PREVIEW_LENGTH) + "…"
      : prompt.content;

  const handleDelete = async () => {
    if (!confirm("Удалить этот промт?")) return;
    setDeleting(true);
    try {
      await deletePrompt(prompt.id);
    } catch (e) {
      console.error(e);
      alert("Ошибка при удалении");
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!isOwner) return;
    try {
      await togglePublic(prompt.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isOwner) return;
    try {
      await toggleFavorite(prompt.id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <article
        className={cn(
          "flex gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
          deleting && "opacity-60 pointer-events-none"
        )}
      >
        <div className="shrink-0 mt-0.5">
          <MessageSquare className="h-5 w-5 text-slate-400" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 truncate">{prompt.title}</h3>
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">{preview}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
              title={prompt.isFavorite ? "Убрать из избранного" : "В избранное"}
            >
              <Star
                className={cn("h-4 w-4", prompt.isFavorite && "fill-current")}
              />
            </Button>
          )}
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTogglePublic}
              className="h-8 w-8"
              title={prompt.isPublic ? "Сделать приватным" : "Сделать публичным"}
            >
              {prompt.isPublic ? (
                <Globe className="h-4 w-4 text-slate-500" />
              ) : (
                <Lock className="h-4 w-4 text-slate-500" />
              )}
            </Button>
          )}
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDialogOpen(true)}
              className="h-8 w-8"
              title="Редактировать"
            >
              <Pencil className="h-4 w-4 text-slate-500" />
            </Button>
          )}
          {showDelete && isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              title="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </article>

      <PromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode="edit"
        prompt={prompt}
      />
    </>
  );
}
