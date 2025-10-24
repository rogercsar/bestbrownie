"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminReportsPage() {
  function exportPdf() {
    const doc = new jsPDF();
    doc.text("Relatório de Vendas", 14, 16);
    autoTable(doc, {
      head: [["Pedido", "Cliente", "Valor", "Status"]],
      body: [
        ["#123", "Maria", "R$ 89,90", "PAID"],
        ["#124", "João", "R$ 49,90", "PENDING"],
      ],
      startY: 22,
    });
    doc.save("relatorio.pdf");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Relatórios</h1>
      <p className="text-zinc-600 mb-4">Exportar PDF com dados de pedidos.</p>
      <button className="bg-black text-white px-4 py-2 rounded" onClick={exportPdf}>
        Exportar PDF
      </button>
    </div>
  );
}