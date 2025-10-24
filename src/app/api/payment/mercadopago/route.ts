import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "MERCADOPAGO_ACCESS_TOKEN não configurado" }, { status: 500 });
    }

    const body = await req.json();
    const { items, successUrl, notificationUrl } = body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items inválidos" }, { status: 400 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const prefResponse = await preference.create({
      body: {
        items: items.map((i: any, idx: number) => ({
          id: String(i.id ?? `${String(i.title)}-${idx}`),
          title: String(i.title),
          quantity: Number(i.quantity || 1),
          unit_price: Number(i.unit_price),
          currency_id: "BRL",
        })),
        back_urls: {
          success: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success`,
          failure: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success`,
          pending: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success`,
        },
        auto_return: "approved",
        notification_url: notificationUrl || `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/payment/webhook`,
      },
    });

    return NextResponse.json({ id: prefResponse.id, init_point: prefResponse.init_point }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erro ao criar preferência" }, { status: 500 });
  }
}