"use client";

import { useEffect, useState } from "react";
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
};

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const add = useCartStore((s) => s.addItem);

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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Cardápio de Brownies</h1>
      {loading && <p>Carregando...</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
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