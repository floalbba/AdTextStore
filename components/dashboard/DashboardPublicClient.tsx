"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SearchInput } from "./SearchInput";

interface DashboardPublicClientProps {
  searchQuery: string;
  sort?: "popular" | "recent";
}

const DEBOUNCE_MS = 300;

export function DashboardPublicClient({ searchQuery, sort = "recent" }: DashboardPublicClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateUrl = useCallback(
    (updates: { q?: string; sort?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.q !== undefined) {
        if (updates.q.trim()) {
          params.set("q", updates.q.trim());
        } else {
          params.delete("q");
        }
        params.delete("page");
      }
      if (updates.sort !== undefined) {
        if (updates.sort !== "recent") {
          params.set("sort", updates.sort);
        } else {
          params.delete("sort");
        }
        params.delete("page");
      }
      router.push(`/dashboard/public?${params.toString()}`);
    },
    [router, searchParams]
  );

  const onSearch = useCallback(
    (v: string) => updateUrl({ q: v }),
    [updateUrl]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput
        key={searchQuery}
        placeholder="Поиск по заголовку и тексту…"
        onSearch={onSearch}
        debounceMs={DEBOUNCE_MS}
        defaultValue={searchQuery}
        className="w-full sm:max-w-xs"
      />
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Сортировка:</span>
        <select
          value={sort}
          onChange={(e) => updateUrl({ sort: e.target.value })}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="recent">По дате</option>
          <option value="popular">По популярности</option>
        </select>
      </div>
    </div>
  );
}
