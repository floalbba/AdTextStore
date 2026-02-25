import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard } from "lucide-react";
export async function Header() {
  let session = null;
  try {
    session = await auth();
  } catch (e) {
    console.error("[Header] auth error:", e);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0 font-semibold text-slate-900">
          AdTextStore
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Главная
          </Link>
          <Link
            href="/dashboard/public"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Каталог
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Мои промты
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden bg-slate-200 ring-1 ring-slate-200">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">
                        <User className="h-4 w-4 text-slate-500" />
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm text-slate-700 max-w-[100px] truncate">
                    {session.user.name || session.user.email?.split("@")[0] || "Пользователь"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    Мои промты
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/api/auth/signout"
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Выйти
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm">Войти</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
