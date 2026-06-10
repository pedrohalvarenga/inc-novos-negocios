"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FileText, Plus, ExternalLink, Loader2, AlertTriangle, Clock } from "lucide-react";
import ContratoStatusBadge from "./ContratoStatusBadge";
import { formatDate, formatCurrency } from "@/lib/formatters";

interface Props {
  terrenoId: string;
  terrenoNome: string;
}

const DATAS_CRITICAS_LABELS: Record<string, string> = {
  dataAssinatura: "Data de Assinatura",
  dataVencimento: "Vencimento",
};

export default function ContratoTab({ terrenoId, terrenoNome }: Props) {
  const [contratos, setContratos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const data = await fetch(`/api/contratos?terrenoId=${terrenoId}`).then((r) => r.json());
    setContratos(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [terrenoId]);

  useEffect(() => { carregar(); }, [carregar]);

  async function criarContrato() {
    setCriando(true);
    try {
      const res = await fetch("/api/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terrenoId }),
      });
      if (res.ok) {
        const c = await res.json();
        window.location.href = `/contratos/${c.id}`;
      }
    } finally {
      setCriando(false);
    }
  }

  function diasParaVencer(data?: string | null): number | null {
    if (!data) return null;
    return Math.round((new Date(data).getTime() - Date.now()) / 86400000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="animate-spin text-[#606060]" />
      </div>
    );
  }

  const contratoAtivo = contratos.find(
    (c) => !["RESCINDIDO"].includes(c.status)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-black">Contrato</h3>
          <p className="text-xs text-[#606060] mt-0.5">
            {contratos.length === 0 ? "Nenhum contrato" : `${contratos.length} contrato(s)`}
          </p>
        </div>
        <button
          onClick={criarContrato}
          disabled={criando}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-black text-white text-xs font-medium hover:bg-[#222] transition-colors disabled:opacity-50"
        >
          {criando ? <Loader2 size={12} className="animate-spin" /> : <Plus size={13} />}
          Novo Contrato
        </button>
      </div>

      {contratos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText size={32} className="text-[#E5E5E5] mb-3" />
          <p className="text-sm font-medium text-black">Nenhum contrato criado</p>
          <p className="text-xs text-[#606060] mt-1 max-w-xs">
            Crie o contrato a partir de uma proposta aceita ou diretamente aqui.
          </p>
          <button
            onClick={criarContrato}
            disabled={criando}
            className="mt-4 flex items-center gap-1.5 h-8 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-[#222]"
          >
            {criando ? <Loader2 size={12} className="animate-spin" /> : <Plus size={13} />}
            Criar Contrato
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {contratos.map((c) => {
            const diasAssinatura = diasParaVencer(c.dataAssinatura);
            const diasVencimento = diasParaVencer(c.dataVencimento);

            return (
              <div key={c.id} className="rounded-xl border border-black/8 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-black">Contrato v{c.versao}</span>
                      <ContratoStatusBadge status={c.status} />
                    </div>

                    {/* Datas críticas */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs mt-2">
                      {c.dataAssinatura && (
                        <span className="text-[#606060]">
                          Assinado em: <span className="text-black font-medium">{formatDate(c.dataAssinatura)}</span>
                        </span>
                      )}
                      {c.dataVencimento && (
                        <span className={diasVencimento !== null && diasVencimento < 15 ? "text-[#c2410c] font-medium" : "text-[#606060]"}>
                          Vencimento: <span className="font-medium">{formatDate(c.dataVencimento)}</span>
                          {diasVencimento !== null && diasVencimento < 15 && ` (${diasVencimento}d)`}
                        </span>
                      )}
                      {c.proposta && (
                        <span className="text-[#606060]">
                          Baseado em: <span className="text-black font-medium">Proposta v{c.proposta.versao}</span>
                        </span>
                      )}
                      {c._count?.lancamentos > 0 && (
                        <span className="text-[#606060]">
                          Lançamentos financeiros: <span className="text-black font-medium">{c._count.lancamentos}</span>
                        </span>
                      )}
                    </div>

                    {/* Alertas de datas próximas */}
                    {diasVencimento !== null && diasVencimento > 0 && diasVencimento <= 15 && (
                      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#c2410c] bg-[#FFF0E8] rounded-lg px-3 py-2">
                        <AlertTriangle size={12} />
                        Vencimento em {diasVencimento} dia{diasVencimento !== 1 ? "s" : ""}
                      </div>
                    )}

                    {c.observacoes && (
                      <p className="mt-3 text-xs text-[#606060] bg-[#F7F7F7] rounded-lg px-3 py-2 line-clamp-2">
                        {c.observacoes}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/contratos/${c.id}`}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-black/20 text-xs font-medium text-[#606060] hover:bg-[#F7F7F7] transition-colors shrink-0"
                  >
                    <ExternalLink size={12} />
                    Abrir Editor
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
