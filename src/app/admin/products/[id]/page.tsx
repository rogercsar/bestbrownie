"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminProductEditPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPrice, setDiscountPrice] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/products/${id}`);
    const json = await res.json();
    if (res.ok) {
      const p = json.product;
      setName(p.name);
      setDescription(p.description || "");
      setPrice(p.price);
      setHasDiscount(Boolean(p.hasDiscount));
      setDiscountPrice(p.discountPrice ?? null);
      setImages(Array.isArray(p.images) ? p.images : []);
      setIsAvailable(Boolean(p.isAvailable));
    } else {
      setError(json.error || "Erro ao carregar produto");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function uploadNewImages(): Promise<string[]> {
    if (newImages.length === 0) return [];
    const form = new FormData();
    newImages.forEach((f) => form.append("images", f));
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Erro no upload");
    return json.urls as string[];
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const urls = await uploadNewImages();
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, price, hasDiscount, discountPrice, images: [...images, ...urls], isAvailable }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao salvar");
      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Editar Produto</h1>
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
          <label className="block text-sm">Imagens atuais</label>
          <div className="flex gap-2 flex-wrap">
            {images.map((url, i) => (
              <img key={i} src={url} alt={name} className="w-24 h-24 object-cover rounded border" />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm">Adicionar novas imagens</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setNewImages(Array.from(e.target.files || []))} />
        </div>
        <button type="submit" disabled={saving} className="bg-black text-white px-4 py-2 rounded">
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}