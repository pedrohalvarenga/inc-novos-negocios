"use client";

import { useEffect, useState } from "react";
import { Plus, Download, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import StatusFinanceiroBadge from "./StatusFinanceiroBadge";
import LancamentosLista from "./LancamentosLista";
import LancamentoForm from "./LancamentoForm";

interface Props {
  terrenoId: string;
  usuarioRole?: string;
}

export default function FinanceiroTab({ terrenoId, usuarioRole }: Props) {
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoAberto, setNovoAberto] = useState(false);

  async function carregar() {
    setLoading(true);
    const ls = await fetch(`/api/financeiro/lancamentos?terrenoId=${terrenoId}`).then((r) => r.json());
    setLancamentos(Array.isArray(ls) ? ls : []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [terrenoId]);

  const total = lancamentos.reduce((s, l) => s + l.valor, 0);
  const pago = lancamentos.filter((l) => l.status === "PAGO").reduce((s, l) => s + l.valor, 0);
  const aPagar = lancamentos.filter((l) => l.status === "A_PAGAR").reduce((s, l) => s + l.valor, 0);
  const atrasado = lancamentos.filter((l) => l.status === "ATRASADO").reduce((s, l) => s + l.valor, 0);

  const proximos = lancamentos
    .filter((l) => l.status !== "PAGO" && l.vencimento)
    .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total acumulado", value: formatCurrency(total), color: "text-black" },
          { label: "Pago", value: formatCurrency(pago), color: "text-green-600" },
          { label: "A pagar", value: formatCurrency(aPagar), color: "text-yellow-600" },
          { label: "Atrasado", value: formatCurrency(atrasado), color: "text-red-600" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-black/8 bg-white p-4">
            <p className="text-xs text-[#606060] mb-1">{k.label}</p>
            <p className={`text-base font-semibold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Próximos vencimentos */}
      {proximos.length > 0 && (
        <div className="rounded-xl border border-black/8 bg-white p-6">
          <h3 className="text-sm font-semibold text-black mb-4">Próximos Vencimentos</h3>
          <div className="space-y-2">
            {proximos.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-black/4 last:border-0">
                <div>
                  <p className="text-sm font-medium text-black">{l.descricao ?? l.tipo}</p>
                  <p className="text-xs text-[#606060]">{formatDate(l.vencimento)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-black">{formatCurrency(l.valor)}</span>
                  <StatusFinanceiroBadge status={l.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista completa */}
      <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-black/6 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-black">Todos os Lançamentos</h3>
          <div className="flex gap-2">
            <a href={`/api/financeiro/relatorio/${terrenoId}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-black/15 text-xs text-[#606060] hover:bg-[#F7F7F7]">
              <ExternalLink size={12} /> PDF
            </a>
            <a href={`/api/financeiro/exportar?terrenoId=${terrenoId}`} target="_blank"
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-black/15 text-xs text-[#606060] hover:bg-[#F7F7F7]">
              <Download size={12} /> CSV
            </a>
            <button onClick={() => setNovoAberto(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#FF7924] text-white text-xs font-medium hover:bg-[#e06a1e]">
              <Plus size={13} /> Novo
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-[#606060]">Carregando…</div>
        ) : (
          <LancamentosLista lancamentos={lancamentos} usuarioRole={usuarioRole} onAtualizar={carregar} />
        )}
      </div>

      {novoAberto && (
        <LancamentoForm
          terrenoId={terrenoId}
          onSalvo={() => { setNovoAberto(false); carregar(); }}
          onFechar={() => setNovoAberto(false)}
        />
      )}
    </div>
  );
}
