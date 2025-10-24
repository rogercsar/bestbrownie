"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCartStore } from "@/store/cart";

export default function MenuDetailPage() {
  const { id } = useParams() as { id: string };
  const add = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/admin/products/${id}`);
      const json = await res.json();
      setProduct(json.product);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!product) return <div className="p-8">Produto não encontrado</div>;

  const price = product.hasDiscount && product.discountPrice ? product.discountPrice : product.price;

  return (
    <div className="p-8 max-w-3xl">
      {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-72 object-cover rounded" />}
      <h1 className="text-2xl font-semibold mt-4">{product.name}</h1>
      <p className="mt-2 text-zinc-600">{product.description}</p>
      <div className="mt-4">
        {product.hasDiscount && product.discountPrice ? (
          <>
            <span className="text-green-700 font-semibold">R$ {product.discountPrice.toFixed(2)}</span>
            <span className="text-zinc-500 line-through ml-2">R$ {product.price.toFixed(2)}</span>
          </>
        ) : (
          <span className="font-semibold">R$ {product.price.toFixed(2)}</span>
        )}
      </div>
      <button className="bg-black text-white px-4 py-2 rounded mt-4" onClick={() => add({ id: product.id, name: product.name, price, quantity: 1 })}>
        Adicionar ao carrinho
      </button>
    </div>
  );
}