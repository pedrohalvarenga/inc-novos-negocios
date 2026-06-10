"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  lancamento: any;
  onPago: () => void;
  onFechar: () => void;
}

export default function PagarModal({ lancamento, onPago, onFechar }: Props) {
  const hoje = new Date().toISOString().split("T")[0];
  const [dataPagamento, setDataPagamento] = useState(hoje);
  const [comprovante, setComprovante] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    await fetch(`/api/financeiro/lancamentos/${lancamento.id}/pagar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataPagamento, comprovante: comprovante || undefined }),
    });
    setSalvando(false);
    onPago();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <h2 className="text-base font-semibold text-black">Confirmar Pagamento</h2>
          <button onClick={onFechar}><X size={18} /></button>
        </div>
        <form onSubmit={confirmar} className="p-6 space-y-4">
          <div className="p-4 bg-[#F7F7F7] rounded-lg">
            <p className="text-xs text-[#606060]">{lancamento.tipo} · {lancamento.descricao ?? ""}</p>
            <p className="text-lg font-bold text-black mt-1">{formatCurrency(lancamento.valor)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[#606060] block mb-1">Data do pagamento</label>
            <input type="date" required value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)}
              className="w-full h-9 rounded-lg border border-black/15 px-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#606060] block mb-1">Comprovante (URL ou referência)</label>
            <input value={comprovante} onChange={(e) => setComprovante(e.target.value)}
              className="w-full h-9 rounded-lg border border-black/15 px-3 text-sm" placeholder="Opcional" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onFechar}
              className="h-9 px-4 rounded-lg border border-black/15 text-sm font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={salvando}
              className="h-9 px-4 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {salvando ? "Confirmando…" : "Confirmar pagamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
