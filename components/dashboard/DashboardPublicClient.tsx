"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SearchInput } from "./SearchInput";

interface DashboardPublicClientProps {
  searchQuery: string;
}

const DEBOUNCE_MS = 300;

export function DashboardPublicClient({ searchQuery }: DashboardPublicClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSearch = useCallback(
    (v: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (v.trim()) {
        params.set("q", v.trim());
        params.set("page", "1");
      } else {
        params.delete("q");
        params.delete("page");
      }
      router.push(`/dashboard/public?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <SearchInput
      key={searchQuery}
      placeholder="Поиск по заголовку и тексту…"
      onSearch={onSearch}
      debounceMs={DEBOUNCE_MS}
      defaultValue={searchQuery}
      className="w-full sm:max-w-xs"
    />
  );
}
