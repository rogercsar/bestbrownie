import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return null;
}

const brownies = [
  {
    name: "Brownie Tradicional",
    description: "Brownie clássico, textura fudge. Aproximadamente 80g.",
    price: 8.9,
    hasDiscount: false,
    discountPrice: null,
    images: ["https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80"],
    isAvailable: true,
  },
  {
    name: "Brownie com Nozes",
    description: "Brownie com pedaços crocantes de nozes. 80g.",
    price: 10.5,
    hasDiscount: false,
    discountPrice: null,
    images: ["https://images.unsplash.com/photo-1558969763-d92e2d43ba9a?auto=format&fit=crop&w=800&q=80"],
    isAvailable: true,
  },
  {
    name: "Brownie de Doce de Leite",
    description: "Brownie recheado com doce de leite artesanal.",
    price: 11.9,
    hasDiscount: true,
    discountPrice: 10.9,
    images: ["https://images.unsplash.com/photo-1518887577700-6e1837a3f1df?auto=format&fit=crop&w=800&q=80"],
    isAvailable: true,
  },
  {
    name: "Brownie Nutella",
    description: "Brownie com cobertura de Nutella generosa.",
    price: 12.9,
    hasDiscount: false,
    discountPrice: null,
    images: ["https://images.unsplash.com/photo-1505253216365-3c5197b71f82?auto=format&fit=crop&w=800&q=80"],
    isAvailable: true,
  },
  {
    name: "Brownie Oreo",
    description: "Brownie com pedaços de Oreo na massa.",
    price: 11.5,
    hasDiscount: false,
    discountPrice: null,
    images: ["https://images.unsplash.com/photo-1564936281391-5ab6a96baa65?auto=format&fit=crop&w=800&q=80"],
    isAvailable: true,
  },
];

export async function POST(_req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    // Evitar duplicar por nome
    const names = brownies.map((b) => b.name);
    const { data: existing, error: selectErr } = await supabaseAdmin
      .from("Product")
      .select("id,name")
      .in("name", names);
    if (selectErr) return NextResponse.json({ error: selectErr.message }, { status: 500 });

    const existingNames = new Set((existing || []).map((e: any) => e.name));
    const toInsert = brownies
      .filter((b) => !existingNames.has(b.name))
      .map((b) => ({ ...b, createdAt: new Date().toISOString() }));

    if (toInsert.length === 0) {
      return NextResponse.json({ inserted: 0, message: "Já existem brownies de exemplo." }, { status: 200 });
    }

    const { error: insertErr } = await supabaseAdmin.from("Product").insert(toInsert);
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    return NextResponse.json({ inserted: toInsert.length }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erro inesperado" }, { status: 500 });
  }
}