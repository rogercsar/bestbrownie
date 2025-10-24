"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/store/cart";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  hasDiscount: boolean;
  discountPrice?: number | null;
  images: string[];
  isAvailable: boolean;
  createdAt?: string;
};

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const add = useCartStore((s) => s.addItem);

  const [query, setQuery] = useState("");
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [sort, setSort] = useState<"recent" | "name-asc" | "name-desc" | "price-asc" | "price-desc">("recent");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/products");
    const json = await res.json();
    setProducts(json.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function addToCart(p: Product) {
    const price = p.hasDiscount && p.discountPrice ? p.discountPrice : p.price;
    add({ id: p.id, name: p.name, price, quantity: 1 });
  }

  const filtered = useMemo(() => {
    let arr = products.filter((p) => {
      const matches = p.name.toLowerCase().includes(query.toLowerCase());
      const promoOk = onlyPromo ? (p.hasDiscount && !!p.discountPrice) : true;
      return matches && promoOk;
    });

    arr.sort((a, b) => {
      if (sort === "recent") {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta; // mais recente primeiro
      }
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      const pa = a.hasDiscount && a.discountPrice ? a.discountPrice : a.price;
      const pb = b.hasDiscount && b.discountPrice ? b.discountPrice : b.price;
      if (sort === "price-asc") return pa - pb;
      if (sort === "price-desc") return pb - pa;
      return 0;
    });

    return arr;
  }, [products, query, onlyPromo, sort]);

  return (
    <div className="px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Best Brownie — Menu</h1>
          <p className="text-zinc-600 mt-2">Descubra sabores artesanais e promoções irresistíveis</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex-1 min-w-[240px]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar sabores (ex: Nutella)"
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <label className="flex items-center gap-2 text-sm bg-white border rounded-lg px-3 py-2">
            <input type="checkbox" checked={onlyPromo} onChange={(e) => setOnlyPromo(e.target.checked)} />
            Apenas promoções
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="recent">Mais recentes</option>
            <option value="name-asc">Nome (A-Z)</option>
            <option value="name-desc">Nome (Z-A)</option>
            <option value="price-asc">Preço (menor)</option>
            <option value="price-desc">Preço (maior)</option>
          </select>
        </div>

        {loading && <p className="text-center">Carregando...</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => {
            const finalPrice = p.hasDiscount && p.discountPrice ? p.discountPrice : p.price;
            const createdMs = p.createdAt ? new Date(p.createdAt).getTime() : 0;
            const isNew = createdMs > 0 && (Date.now() - createdMs) <= (14 * 24 * 60 * 60 * 1000);
            return (
              <div key={p.id} className="bg-white rounded-xl shadow hover:shadow-md transition p-3">
                <div className="relative">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-500">
                      Sem imagem
                    </div>
                  )}

                  {p.hasDiscount && p.discountPrice && (
                    <span className="absolute top-2 left-2 bg-brand text-black text-xs px-2 py-1 rounded-full">
                      Promoção
                    </span>
                  )}
                  {!p.isAvailable && (
                    <span className="absolute top-2 right-2 bg-zinc-800 text-white text-xs px-2 py-1 rounded-full">
                      Indisponível
                    </span>
                  )}
                  {isNew && (
                    <span className="absolute bottom-2 left-2 bg-brand text-black text-xs px-2 py-1 rounded-full">
                      Novo
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  {p.description && (
                    <p className="text-sm text-zinc-600 line-clamp-2">{p.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    {p.hasDiscount && p.discountPrice ? (
                      <>
                        <span className="text-emerald-700 font-bold">R$ {finalPrice.toFixed(2)}</span>
                        <span className="text-zinc-500 line-through">R$ {p.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-bold">R$ {finalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      className="flex-1 bg-brand text-black px-3 py-2 rounded-lg hover:bg-brand-600 disabled:opacity-50"
                      onClick={() => addToCart(p)}
                      disabled={!p.isAvailable}
                    >
                      Adicionar
                    </button>
                    <Link
                      className="px-3 py-2 border rounded-lg text-sm hover:bg-brand-100"
                      href={`/menu/${p.id}`}
                    >
                      Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}