import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, context: any) {
  const { params } = context;
  const { data, error } = await supabase
    .from("Product")
    .select("*")
    .eq("id", params.id)
    .eq("isAvailable", true)
    .single();

  if (error?.code === "PGRST116" || (!error && !data)) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ product: data }, { status: 200 });
}