"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Download, Filter, X } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import ScoreBadge from "@/components/common/ScoreBadge";
import EmptyState from "@/components/common/EmptyState";
import { formatCurrency, formatPercent, formatDays } from "@/lib/formatters";
import { FORMA_PAGAMENTO_LABELS, STATUS_TERRENO_LABELS } from "@/lib/constants";
import { faixaVgvColor } from "@/lib/score";
import { MapPin } from "lucide-react";
import type { StatusTerreno, FormaPagamento } from "@prisma/client";

const STATUS_OPTIONS: StatusTerreno[] = [
  "PROSPECCAO", "EM_NEGOCIACAO", "PROPOSTA_ENVIADA", "PROPOSTA_ACEITA",
  "CONTRATO_EM_ELABORACAO", "CONTRATO_ASSINADO", "DESCARTADO",
];

const PAGAMENTO_OPTIONS: FormaPagamento[] = [
  "PERMUTA_FISICA", "PERMUTA_FINANCEIRA", "DINHEIRO_PRAZO", "DINHEIRO_VISTA", "MISTO",
];

export default function TerrenosContent() {
  const [terrenos, setTerrenos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [filtroPagamento, setFiltroPagamento] = useState<string>("");
  const [ordenacao, setOrdenacao] = useState<"updatedAt" | "score" | "vgv">("updatedAt");

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (filtroStatus) params.set("status", filtroStatus);
    if (filtroPagamento) params.set("formaPagamento", filtroPagamento);

    const data = await fetch(`/api/terrenos?${params}`).then((r) => r.json());
    setTerrenos(data);
    setLoading(false);
  }, [busca, filtroStatus, filtroPagamento]);

  useEffect(() => {
    const timer = setTimeout(carregar, 300);
    return () => clearTimeout(timer);
  }, [carregar]);

  const sorted = [...terrenos].sort((a, b) => {
    if (ordenacao === "score") return (b.score ?? 0) - (a.score ?? 0);
    if (ordenacao === "vgv") return (b.vgvEstimado ?? 0) - (a.vgvEstimado ?? 0);
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const hasFilters = busca || filtroStatus || filtroPagamento;

  function limparFiltros() {
    setBusca("");
    setFiltroStatus("");
    setFiltroPagamento("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Terrenos"
        description={`${terrenos.length} terreno${terrenos.length !== 1 ? "s" : ""} cadastrado${terrenos.length !== 1 ? "s" : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <a
              href="/api/terrenos/exportar"
              download
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-black/20 text-sm font-medium text-black hover:bg-[#F7F7F7] transition-colors"
            >
              <Download size={15} />
              Exportar
            </a>
            <Link
              href="/terrenos/novo"
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              <Plus size={15} />
              Novo Terreno
            </Link>
          </div>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, cidade, bairro..."
            className="h-9 pl-8 pr-4 rounded-lg border border-black/20 text-sm bg-white outline-none focus:border-black transition w-64"
          />
        </div>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="h-9 px-3 rounded-lg border border-black/20 text-sm bg-white outline-none focus:border-black transition"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_TERRENO_LABELS[s]}</option>
          ))}
        </select>

        <select
          value={filtroPagamento}
          onChange={(e) => setFiltroPagamento(e.target.value)}
          className="h-9 px-3 rounded-lg border border-black/20 text-sm bg-white outline-none focus:border-black transition"
        >
          <option value="">Forma de pagamento</option>
          {PAGAMENTO_OPTIONS.map((f) => (
            <option key={f} value={f}>{FORMA_PAGAMENTO_LABELS[f]}</option>
          ))}
        </select>

        <select
          value={ordenacao}
          onChange={(e) => setOrdenacao(e.target.value as any)}
          className="h-9 px-3 rounded-lg border border-black/20 text-sm bg-white outline-none focus:border-black transition"
        >
          <option value="updatedAt">Ordenar: Recente</option>
          <option value="score">Ordenar: Score</option>
          <option value="vgv">Ordenar: VGV</option>
        </select>

        {hasFilters && (
          <button
            onClick={limparFiltros}
            className="flex items-center gap-1 h-9 px-3 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors"
          >
            <X size={13} />
            Limpar
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Nenhum terreno encontrado"
            description={hasFilters ? "Tente outros filtros de busca." : "Cadastre o primeiro terreno para começar."}
            action={
              !hasFilters ? (
                <Link
                  href="/terrenos/novo"
                  className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  <Plus size={15} />
                  Novo Terreno
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/6 bg-[#FAFAFA]">
                  {["Terreno", "Cidade", "Status", "Unid.", "VGV", "Valor Compra", "% VGV", "Pagamento", "Score", "Dias/Etapa"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#606060] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/4">
                {sorted.map((t) => {
                  const pct = t.valorCompra && t.vgvEstimado && t.vgvEstimado > 0
                    ? (t.valorCompra / t.vgvEstimado) * 100
                    : null;

                  return (
                    <tr key={t.id} className="hover:bg-[#F7F7F7] transition-colors group">
                      <td className="px-4 py-3">
                        <Link href={`/terrenos/${t.id}`} className="font-medium text-black hover:text-[#F26522] transition-colors">
                          {t.nome}
                        </Link>
                        {t.apelido && (
                          <p className="text-xs text-[#A0A0A0]">{t.apelido}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#606060] whitespace-nowrap">
                        {t.cidade}/{t.uf}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-[#606060] text-center">
                        {t.numUnidadesEstimado ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[#606060] whitespace-nowrap">
                        {formatCurrency(t.vgvEstimado)}
                      </td>
                      <td className="px-4 py-3 text-[#606060] whitespace-nowrap">
                        {formatCurrency(t.valorCompra)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {pct != null ? (
                          <span className="font-semibold" style={{ color: faixaVgvColor(pct <= 10 ? "verde" : pct <= 15 ? "amarelo" : "vermelho") }}>
                            {formatPercent(pct)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#606060] whitespace-nowrap">
                        {t.formaPagamento ? FORMA_PAGAMENTO_LABELS[t.formaPagamento as keyof typeof FORMA_PAGAMENTO_LABELS] : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={t.score} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-[#606060] text-right text-xs">
                        {t.diasNaEtapa}d
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
