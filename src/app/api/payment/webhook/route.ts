import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    // Exemplo mínimo: quando pago, poderia atualizar pedido
    if (event?.type === "payment" && event?.data?.id) {
      // Aqui você pode consultar o pagamento e atualizar seu pedido
      // Mantendo genérico por enquanto
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erro no webhook" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}