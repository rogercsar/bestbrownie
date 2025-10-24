import Link from "next/link";

export default function Home() {
  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Best Brownie</h1>
          <p className="mt-3 text-lg text-zinc-600">Brownies artesanais com ingredientes selecionados e muito carinho.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/menu" className="bg-black text-white px-5 py-2.5 rounded">Ver menu</Link>
            <Link href="/admin/login" className="px-5 py-2.5 border rounded">Área admin</Link>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden shadow">
          <img src="https://images.unsplash.com/photo-1564936281391-5ab6a96baa65?q=80&w=1200&auto=format&fit=crop" alt="Brownies artesanais" className="w-full h-80 object-cover" />
        </div>
      </div>
    </section>
  );
}
