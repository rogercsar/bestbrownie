import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold">Meus Brownies</span>
          <nav className="flex gap-3">
            <Link href="/menu" className="px-3 py-1 border rounded">Menu</Link>
            <Link href="/admin/login" className="px-3 py-1">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold">Brownies artesanais</h1>
        <p className="mt-2 text-zinc-600">Escolha seus sabores favoritos e faça seu pedido.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/menu" className="bg-black text-white px-4 py-2 rounded">Ver menu</Link>
          <Link href="/admin/login" className="px-4 py-2 border rounded">Área admin</Link>
        </div>
      </main>
    </div>
  );
}
