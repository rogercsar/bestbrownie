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

export async function GET(_: NextRequest, context: any) {
  const { params } = context;
  const { data, error } = await supabase.from("Product").select("*").eq("id", params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data }, { status: 200 });
}

export async function PUT(req: NextRequest, context: any) {
  const { params } = context;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const update = {
    name: body.name != null ? String(body.name) : undefined,
    description: body.description != null ? String(body.description) : undefined,
    price: body.price != null ? Number(body.price) : undefined,
    hasDiscount: body.hasDiscount != null ? Boolean(body.hasDiscount) : undefined,
    discountPrice: body.discountPrice === null ? null : body.discountPrice != null ? Number(body.discountPrice) : undefined,
    images: Array.isArray(body.images) ? body.images.map(String) : undefined,
    isAvailable: body.isAvailable != null ? Boolean(body.isAvailable) : undefined,
  };
  const { data, error } = await supabaseAdmin.from("Product").update(update).eq("id", params.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data }, { status: 200 });
}

export async function DELETE(_: NextRequest, context: any) {
  const { params } = context;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { error } = await supabaseAdmin.from("Product").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 200 });
}