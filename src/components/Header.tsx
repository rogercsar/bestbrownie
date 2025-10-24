import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-brand border-b border-brand-600/40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/brownie-logo.svg" alt="Best Brownie" className="h-7 w-7" />
          <span className="text-xl font-bold text-black">Best Brownie</span>
          <span className="text-sm text-black/70">confeitaria</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/menu" className="px-3 py-1 rounded hover:bg-brand-100">Menu</Link>
          <Link href="/admin/login" className="px-3 py-1 rounded hover:bg-brand-100">Área admin</Link>
        </nav>
      </div>
    </header>
  );
}