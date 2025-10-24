"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProductNewPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPrice, setDiscountPrice] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadImages(): Promise<string[]> {
    if (images.length === 0) return [];
    const form = new FormData();
    images.forEach((f) => form.append("images", f));
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Erro no upload");
    return json.urls as string[];
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const urls = await uploadImages();
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, price, hasDiscount, discountPrice, images: urls, isAvailable }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao criar produto");
      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Novo Produto</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Nome</label>
          <input className="border rounded px-3 py-2 w-full" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm">Descrição</label>
          <textarea className="border rounded px-3 py-2 w-full" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Preço</label>
            <input type="number" step="0.01" className="border rounded px-3 py-2 w-full" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input type="checkbox" checked={hasDiscount} onChange={(e) => setHasDiscount(e.target.checked)} />
            <span>Tem desconto?</span>
          </div>
          {hasDiscount && (
            <div>
              <label className="block text-sm">Preço com desconto</label>
              <input type="number" step="0.01" className="border rounded px-3 py-2 w-full" value={discountPrice ?? 0} onChange={(e) => setDiscountPrice(Number(e.target.value))} />
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm">Disponível</label>
          <select className="border rounded px-3 py-2" value={isAvailable ? "sim" : "nao"} onChange={(e) => setIsAvailable(e.target.value === "sim")}> 
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Imagens (até 3)</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} />
        </div>
        <button type="submit" disabled={loading} className="bg-black text-white px-4 py-2 rounded">
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}