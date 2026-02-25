import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6">
        <p className="text-sm text-slate-600">
          © {year} AdTextStore
        </p>
        <nav className="flex items-center gap-6">
          <Link
            href="/policy"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Политика
          </Link>
          <Link
            href="/contacts"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Контакты
          </Link>
        </nav>
      </div>
    </footer>
  );
}
