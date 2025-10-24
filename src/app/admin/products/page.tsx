"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  hasDiscount: boolean;
  discountPrice?: number | null;
  isAvailable: boolean;
  images: string[];
  createdAt?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState<"recent" | "name-asc" | "name-desc" | "price-asc" | "price-desc">("recent");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  useEffect(() => {
    setPage(1); // resetar para primeira página quando filtros mudarem
  }, [query, onlyAvailable, sort, pageSize]);

  async function removeProduct(id: string) {
    if (!confirm("Excluir produto?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  async function toggleAvailability(p: Product) {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !p.isAvailable }),
    });
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

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matches = p.name.toLowerCase().includes(query.toLowerCase());
      const availableOk = onlyAvailable ? p.isAvailable : true;
      return matches && availableOk;
    });
  }, [products, query, onlyAvailable]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (sort === "recent") {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
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
  }, [filtered, sort]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

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

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome"
          className="border rounded px-3 py-2 w-64"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
          Mostrar apenas disponíveis
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="border rounded px-2 py-2 text-sm">
          <option value="recent">Mais recentes</option>
          <option value="name-asc">Nome (A-Z)</option>
          <option value="name-desc">Nome (Z-A)</option>
          <option value="price-asc">Preço (menor)</option>
          <option value="price-desc">Preço (maior)</option>
        </select>
        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border rounded px-2 py-2 text-sm">
          <option value={5}>5 por página</option>
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
        </select>
      </div>

      {seedMsg && <p className="mb-2 text-sm text-zinc-700">{seedMsg}</p>}
      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-zinc-100">
            <th className="p-2 text-left">Imagem</th>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Preço</th>
            <th className="p-2">Disponível</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2 w-20">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-zinc-200 rounded" />
                )}
              </td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">R$ {p.hasDiscount && p.discountPrice ? p.discountPrice.toFixed(2) : p.price.toFixed(2)}</td>
              <td className="p-2 text-center">{p.isAvailable ? "Sim" : "Não"}</td>
              <td className="p-2 text-center">
                <button onClick={() => toggleAvailability(p)} className="px-3 py-1 border rounded mr-2">
                  {p.isAvailable ? "Desativar" : "Ativar"}
                </button>
                <Link href={`/admin/products/${p.id}`} className="px-3 py-1 border rounded mr-2">Editar</Link>
                <button onClick={() => removeProduct(p.id)} className="px-3 py-1 border rounded text-red-600">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-3">
        <span className="text-sm text-zinc-600">
          Página {currentPage} de {totalPages} — {total} itens
        </span>
        <div className="flex gap-2">
          <button
            className="border px-3 py-1 rounded"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            Anterior
          </button>
          <button
            className="border px-3 py-1 rounded"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}