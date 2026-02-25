"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SearchInput } from "./SearchInput";

interface DashboardPromptsClientProps {
  searchQuery: string;
}

const DEBOUNCE_MS = 300;

export function DashboardPromptsClient({ searchQuery }: DashboardPromptsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchQuery);

  useEffect(() => {
    setValue(searchQuery);
  }, [searchQuery]);

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
      router.push(`/dashboard?${params.toString()}`);
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
