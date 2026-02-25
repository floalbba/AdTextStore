import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          AdTextStore
        </Link>

        <nav className="flex items-center gap-6">
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

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
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
                <span className="text-sm text-slate-700 max-w-[120px] truncate">
                  {session.user.name || session.user.email?.split("@")[0] || "Пользователь"}
                </span>
              </div>
              <Link href="/api/auth/signout">
                <Button variant="outline" size="sm" className="gap-1">
                  <LogOut className="h-4 w-4" />
                  Выйти
                </Button>
              </Link>
            </>
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
