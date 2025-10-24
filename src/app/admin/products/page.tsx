"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  hasDiscount: boolean;
  discountPrice?: number | null;
  isAvailable: boolean;
  images: string[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/products");
    const json = await res.json();
    if (!res.ok) setError(json.error || "Erro ao carregar");
    setProducts(json.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function removeProduct(id: string) {
    if (!confirm("Excluir produto?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  async function seedBrownies() {
    setSeeding(true);
    setSeedMsg(null);
    const res = await fetch("/api/admin/seed-products", { method: "POST" });
    const json = await res.json();
    if (res.ok) {
      setSeedMsg(`Inseridos: ${json.inserted || 0}`);
      load();
    } else {
      setSeedMsg(json.error || "Falha ao inserir");
    }
    setSeeding(false);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Produtos (Brownies)</h1>
        <div className="flex gap-2">
          <button onClick={seedBrownies} disabled={seeding} className="border px-4 py-2 rounded">
            {seeding ? "Inserindo..." : "Inserir exemplos"}
          </button>
          <Link href="/admin/products/new" className="bg-black text-white px-4 py-2 rounded">Novo</Link>
        </div>
      </div>
      {seedMsg && <p className="mb-4 text-sm text-zinc-700">{seedMsg}</p>}
      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-zinc-100">
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Preço</th>
            <th className="p-2">Disponível</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.name}</td>
              <td className="p-2">R$ {p.hasDiscount && p.discountPrice ? p.discountPrice.toFixed(2) : p.price.toFixed(2)}</td>
              <td className="p-2 text-center">{p.isAvailable ? "Sim" : "Não"}</td>
              <td className="p-2 text-center">
                <Link href={`/admin/products/${p.id}`} className="px-3 py-1 border rounded mr-2">Editar</Link>
                <button onClick={() => removeProduct(p.id)} className="px-3 py-1 border rounded text-red-600">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}