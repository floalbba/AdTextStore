"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  promptId: string;
  initialLiked: boolean;
  initialCount: number;
  /** Если false — не авторизован, показываем disabled и подсказку */
  isAuthenticated: boolean;
}

export function LikeButton({
  promptId,
  initialLiked,
  initialCount,
  isAuthenticated,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login?callbackUrl=" + encodeURIComponent(window.location.pathname);
      return;
    }
    if (loading) return;

    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setLoading(true);

    try {
      const res = await fetch(`/api/prompts/${promptId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        setLiked(prevLiked);
        setCount(prevCount);
        if (res.status === 401) {
          window.location.href = "/login?callbackUrl=" + encodeURIComponent(window.location.pathname);
          return;
        }
        if (res.status === 404 || res.status === 403) {
          alert(data.error || "Ошибка");
          return;
        }
        alert("Попробуйте позже");
        return;
      }

      setLiked(data.liked);
      setCount(data.likesCount);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
      alert("Попробуйте позже");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={loading}
        title={isAuthenticated ? (liked ? "Убрать лайк" : "Нравится") : "Войдите, чтобы поставить лайк"}
        className={cn(
          "h-8 gap-1 px-2",
          liked && "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        )}
      >
        <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
        <span className="text-sm tabular-nums">{count}</span>
      </Button>
    </div>
  );
}
