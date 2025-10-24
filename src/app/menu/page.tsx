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
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Cardápio de Brownies</h1>

      <div className="flex items-center gap-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome"
          className="border rounded px-3 py-2 w-64"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyPromo} onChange={(e) => setOnlyPromo(e.target.checked)} />
          Mostrar promoções
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="border rounded px-2 py-2 text-sm">
          <option value="recent">Mais recentes</option>
          <option value="name-asc">Nome (A-Z)</option>
          <option value="name-desc">Nome (Z-A)</option>
          <option value="price-asc">Preço (menor)</option>
          <option value="price-desc">Preço (maior)</option>
        </select>
      </div>

      {loading && <p>Carregando...</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <div key={p.id} className="border rounded p-3">
            {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-40 object-cover rounded" />}
            <h2 className="text-lg font-semibold mt-2">{p.name}</h2>
            <p className="text-sm text-zinc-600">{p.description}</p>
            <div className="mt-2">
              {p.hasDiscount && p.discountPrice ? (
                <>
                  <span className="text-green-700 font-semibold">R$ {p.discountPrice.toFixed(2)}</span>
                  <span className="text-zinc-500 line-through ml-2">R$ {p.price.toFixed(2)}</span>
                </>
              ) : (
                <span className="font-semibold">R$ {p.price.toFixed(2)}</span>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <button className="bg-black text-white px-3 py-1 rounded" onClick={() => addToCart(p)}>Adicionar</button>
              <Link className="px-3 py-1 border rounded" href={`/menu/${p.id}`}>Detalhes</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}