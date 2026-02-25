"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  MessageSquare,
  Globe,
  Bookmark,
  History,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  { href: "/dashboard", label: "Промты", icon: MessageSquare },
  { href: "/dashboard/public", label: "Публичные промты", icon: Globe },
  { href: "/dashboard/favorites", label: "Избранное", icon: Bookmark },
  { href: "/dashboard/history", label: "История", icon: History },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  const displayName = user.name || user.email?.split("@")[0] || "Пользователь";
  const shortName = displayName.split(" ").slice(0, 2).map((s) => s[0]).join("") || displayName[0];

  return (
    <aside
      className={cn(
        "w-[280px] shrink-0 flex flex-col",
        "bg-gradient-to-b from-[#e8f4fc] to-[#d4edfa]",
        "border-r border-slate-200/60"
      )}
    >
      <div className="p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-14 w-14 rounded-full overflow-hidden bg-slate-200 ring-2 ring-white shadow-sm">
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-600">
                {shortName.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-800 truncate max-w-full px-2 text-center">
            {displayName}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#b8e0f5] text-slate-900 shadow-sm"
                      : "text-slate-700 hover:bg-[#d4edfa]/80 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 pb-4">
        <Link
          href="/api/auth/signout"
          className="block w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-center text-sm text-slate-600 hover:bg-white hover:text-slate-800 transition-colors"
        >
          Выйти
        </Link>
      </div>
    </aside>
  );
}
