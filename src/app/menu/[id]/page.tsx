"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCartStore } from "@/store/cart";
import Link from "next/link";

export default function MenuDetailPage() {
  const { id } = useParams() as { id: string };
  const add = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`);
      const json = await res.json();
      setProduct(json.product);
      setIndex(0);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="px-6 py-10 text-center">Carregando...</div>;
  if (!product) return <div className="px-6 py-10">Produto não encontrado</div>;

  const images: string[] = Array.isArray(product.images) ? product.images : [];
  const finalPrice = product.hasDiscount && product.discountPrice ? product.discountPrice : product.price;
  const createdMs = product.createdAt ? new Date(product.createdAt).getTime() : 0;
  const isNew = createdMs > 0 && (Date.now() - createdMs) <= (14 * 24 * 60 * 60 * 1000);

  function prev() {
    setIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0));
  }
  function next() {
    setIndex((i) => (images.length ? (i + 1) % images.length : 0));
  }
  function goTo(i: number) {
    if (!images.length) return;
    setIndex(Math.max(0, Math.min(images.length - 1, i)));
  }

  return (
    <div className="px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="relative">
              {images.length ? (
                <img src={images[index]} alt={product.name} className="w-full h-80 object-cover rounded-xl" />
              ) : (
                <div className="w-full h-80 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-500">
                  Sem imagem
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    aria-label="Imagem anterior"
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#E3C097] text-black/80 w-9 h-9 rounded-full grid place-items-center shadow hover:bg-[#D4AD7B]"
                  >
                    ‹
                  </button>
                  <button
                    aria-label="Próxima imagem"
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#E3C097] text-black/80 w-9 h-9 rounded-full grid place-items-center shadow hover:bg-[#D4AD7B]"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((src: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`border rounded-lg overflow-hidden ${i === index ? "ring-2 ring-[#E3C097]" : ""}`}
                  >
                    <img src={src} alt={`${product.name} ${i + 1}`} className="w-20 h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              {product.hasDiscount && product.discountPrice && (
                <span className="bg-[#E3C097] text-black text-xs px-2 py-1 rounded-full">Promoção</span>
              )}
              {!product.isAvailable && (
                <span className="bg-zinc-800 text-white text-xs px-2 py-1 rounded-full">Indisponível</span>
              )}
              {isNew && (
                <span className="bg-[#E3C097] text-black text-xs px-2 py-1 rounded-full">Novo</span>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.description && <p className="mt-2 text-zinc-700">{product.description}</p>}

            <div className="mt-4 flex items-center gap-3">
              {product.hasDiscount && product.discountPrice ? (
                <>
                  <span className="text-emerald-700 text-2xl font-bold">R$ {finalPrice.toFixed(2)}</span>
                  <span className="text-zinc-500 line-through">R$ {product.price.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-2xl font-bold">R$ {finalPrice.toFixed(2)}</span>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="bg-[#E3C097] text-black px-5 py-3 rounded-lg hover:bg-[#D4AD7B] disabled:opacity-50"
                onClick={() => add({ id: product.id, name: product.name, price: finalPrice, quantity: 1 })}
                disabled={!product.isAvailable}
              >
                Adicionar ao carrinho
              </button>
              <Link href="/menu" className="px-5 py-3 border rounded-lg hover:bg-[#F7E9D0]">
                Voltar ao menu
              </Link>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold">Detalhes</h2>
              <ul className="text-sm text-zinc-600 mt-2 space-y-1">
                <li>{product.isAvailable ? "Disponível" : "Indisponível"}</li>
                {product.createdAt && (
                  <li>Adicionado: {new Date(product.createdAt).toLocaleDateString()}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}