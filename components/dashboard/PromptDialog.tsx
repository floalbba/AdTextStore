"use client";

import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPrompt, updatePrompt } from "@/actions/prompts";

interface PromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  prompt?: {
    id: string;
    title: string;
    content: string;
    isPublic: boolean;
  };
}

export function PromptDialog({
  open,
  onOpenChange,
  mode,
  prompt,
}: PromptDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        if (mode === "create") {
          const result = await createPrompt(formData);
          if (result?.error) {
            const first = Object.values(result.error)[0]?.[0];
            if (first) alert(first);
            return;
          }
        } else if (prompt) {
          formData.set("id", prompt.id);
          const result = await updatePrompt(formData);
          if (result?.error) {
            const first = Object.values(result.error)[0]?.[0];
            if (first) alert(first);
            return;
          }
        }
        onOpenChange(false);
        form.reset();
      } catch (err) {
        console.error(err);
        alert("Произошла ошибка");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Новый промт" : "Редактировать промт"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              name="title"
              defaultValue={prompt?.title}
              placeholder="Название промта"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Текст промта</Label>
            <textarea
              id="content"
              name="content"
              defaultValue={prompt?.content}
              placeholder="Введите текст промта..."
              required
              disabled={isPending}
              rows={5}
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50 min-h-[100px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              value="true"
              defaultChecked={prompt?.isPublic ?? false}
              disabled={isPending}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            />
            <Label htmlFor="isPublic" className="cursor-pointer">
              Публичный (виден другим пользователям)
            </Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Сохранение…" : mode === "create" ? "Создать" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
