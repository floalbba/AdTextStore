"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  className?: string;
  defaultValue?: string;
}

export function SearchInput({
  placeholder = "Поиск…",
  onSearch,
  debounceMs = 300,
  className,
  defaultValue = "",
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);

  const debouncedSearch = useCallback(
    (v: string) => {
      const t = setTimeout(() => onSearch(v), debounceMs);
      return () => clearTimeout(t);
    },
    [onSearch, debounceMs]
  );

  useEffect(() => {
    return debouncedSearch(value);
  }, [value, debouncedSearch]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
