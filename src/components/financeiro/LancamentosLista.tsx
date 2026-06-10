"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import StatusFinanceiroBadge from "./StatusFinanceiroBadge";
import PagarModal from "./PagarModal";
import { Trash2, CreditCard, FileText } from "lucide-react";

const TIPO_LABELS: Record<string, string> = {
  PARCELA_TERRENISTA: "Parcela Terrenista",
  IPTU: "IPTU",
  MANUTENCAO: "Manutenção",
  CERCA: "Cerca",
  COMISSAO: "Comissão",
  CARTORIO: "Cartório",
  OUTROS: "Outros",
};

interface Props {
  lancamentos: any[];
  usuarioRole?: string;
  onAtualizar: () => void;
  mostrarTerreno?: boolean;
}

export default function LancamentosLista({ lancamentos, usuarioRole, onAtualizar, mostrarTerreno }: Props) {
  const [pagando, setPagando] = useState<any>(null);

  async function excluir(id: string) {
    if (!confirm("Excluir este lançamento?")) return;
    await fetch(`/api/financeiro/lancamentos/${id}`, { method: "DELETE" });
    onAtualizar();
  }

  const atrasados = lancamentos.filter((l) => l.status === "ATRASADO");
  const resto = lancamentos.filter((l) => l.status !== "ATRASADO");
  const ordenados = [...atrasados, ...resto];

  const podeConfirmarPagamento = !usuarioRole || ["GESTOR", "ADMIN"].includes(usuarioRole);

  if (!ordenados.length) {
    return <p className="text-sm text-[#A0A0A0] py-8 text-center">Nenhum lançamento encontrado.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/8">
              {mostrarTerreno && <th className="text-left py-2.5 px-3 text-xs font-medium text-[#606060]">Terreno</th>}
              <th className="text-left py-2.5 px-3 text-xs font-medium text-[#606060]">Tipo</th>
              <th className="text-left py-2.5 px-3 text-xs font-medium text-[#606060]">Descrição</th>
              <th className="text-right py-2.5 px-3 text-xs font-medium text-[#606060]">Valor</th>
              <th className="text-left py-2.5 px-3 text-xs font-medium text-[#606060]">Vencimento</th>
              <th className="text-left py-2.5 px-3 text-xs font-medium text-[#606060]">Status</th>
              <th className="text-left py-2.5 px-3 text-xs font-medium text-[#606060]">Pago em</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {ordenados.map((l) => (
              <tr key={l.id} className={`border-b border-black/4 hover:bg-[#FAFAFA] ${l.status === "ATRASADO" ? "bg-red-50/40" : ""}`}>
                {mostrarTerreno && (
                  <td className="py-3 px-3 font-medium text-black">{l.terreno?.nome ?? "—"}</td>
                )}
                <td className="py-3 px-3 text-[#606060]">{TIPO_LABELS[l.tipo] ?? l.tipo}</td>
                <td className="py-3 px-3 text-[#606060] max-w-[200px] truncate">{l.descricao ?? "—"}</td>
                <td className="py-3 px-3 text-right font-medium text-black">{formatCurrency(l.valor)}</td>
                <td className="py-3 px-3 text-[#606060]">{formatDate(l.vencimento)}</td>
                <td className="py-3 px-3"><StatusFinanceiroBadge status={l.status} /></td>
                <td className="py-3 px-3 text-[#606060]">{formatDate(l.dataPagamento)}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 justify-end">
                    {l.status !== "PAGO" && podeConfirmarPagamento && (
                      <button onClick={() => setPagando(l)} title="Registrar pagamento"
                        className="p-1.5 rounded hover:bg-green-50 text-green-600">
                        <CreditCard size={14} />
                      </button>
                    )}
                    {l.comprovante && (
                      <a href={l.comprovante} target="_blank" rel="noopener noreferrer" title="Ver comprovante"
                        className="p-1.5 rounded hover:bg-[#F7F7F7] text-[#606060]">
                        <FileText size={14} />
                      </a>
                    )}
                    <button onClick={() => excluir(l.id)} title="Excluir"
                      className="p-1.5 rounded hover:bg-red-50 text-[#A0A0A0] hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagando && (
        <PagarModal lancamento={pagando} onPago={() => { setPagando(null); onAtualizar(); }} onFechar={() => setPagando(null)} />
      )}
    </>
  );
}
