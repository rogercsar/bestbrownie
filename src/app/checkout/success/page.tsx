"use client";

export default function SuccessPage() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5599999999999"; // Ex.: 55DDDNUMERO
  const text = encodeURIComponent("Pedido realizado! Gostaria de confirmar via WhatsApp.");
  const wa = `https://wa.me/${number}?text=${text}`;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Pagamento aprovado!</h1>
      <p className="mb-6">Obrigado pelo pedido. Você pode falar conosco pelo WhatsApp para confirmar a entrega.</p>
      <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 text-white px-4 py-2 rounded">
        Abrir WhatsApp
      </a>
    </div>
  );
}