import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
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

export async function GET() {
  const { data, error } = await supabase.from("Product").select("*").order("createdAt", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data ?? [] });
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const product = {
    name: String(body.name),
    description: String(body.description || ""),
    price: Number(body.price),
    hasDiscount: Boolean(body.hasDiscount || false),
    discountPrice: body.discountPrice != null ? Number(body.discountPrice) : null,
    images: Array.isArray(body.images) ? body.images.map(String) : [],
    isAvailable: body.isAvailable != null ? Boolean(body.isAvailable) : true,
    createdAt: new Date().toISOString(),
  };
  const { data, error } = await supabaseAdmin.from("Product").insert(product).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data }, { status: 201 });
}