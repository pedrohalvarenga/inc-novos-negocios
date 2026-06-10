"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, FileText, ExternalLink, TrendingUp } from "lucide-react";
import PropostaStatusBadge from "./PropostaStatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { FORMA_PAGAMENTO_LABELS } from "@/lib/constants";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "RASCUNHO", label: "Rascunho" },
  { value: "ENVIADA", label: "Enviada" },
  { value: "EM_NEGOCIACAO", label: "Em Negociação" },
  { value: "ACEITA", label: "Aceita" },
  { value: "RECUSADA", label: "Recusada" },
  { value: "EXPIRADA", label: "Expirada" },
];

export default function PropostasContent() {
  const [propostas, setPropostas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  async function carregar() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFiltro) params.set("status", statusFiltro);
    if (dataInicio) params.set("dataInicio", dataInicio);
    if (dataFim) params.set("dataFim", dataFim);
    if (busca) params.set("busca", busca);
    const data = await fetch(`/api/propostas?${params}`).then((r) => r.json());
    setPropostas(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [statusFiltro, dataInicio, dataFim]);

  function handleBusca(e: React.FormEvent) {
    e.preventDefault();
    carregar();
  }

  // Taxa de conversão
  const total = propostas.length;
  const aceitas = propostas.filter((p) => p.status === "ACEITA").length;
  const comContrato = propostas.filter((p) => p.baseParaContrato).length;
  const taxaConversao = total > 0 ? Math.round((aceitas / total) * 100) : 0;

  return (
    <div className="p-8">
      <PageHeader
        title="Propostas"
        description="Gestão de propostas de aquisição de terrenos"
      />

      {/* KPIs de conversão */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total de Propostas", value: total.toString() },
          { label: "Aceitas", value: aceitas.toString() },
          { label: "Geradas Contrato", value: comContrato.toString() },
          { label: "Taxa de Conversão", value: `${taxaConversao}%` },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-black/8 bg-white p-4">
            <p className="text-xs text-[#606060] mb-1">{k.label}</p>
            <p className="text-lg font-semibold text-black">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-black/8 bg-white p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleBusca} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por terreno ou cidade..."
                className="w-full h-9 pl-8 pr-3 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <button type="submit" className="h-9 px-4 rounded-lg bg-black text-white text-sm font-medium hover:bg-[#222] transition-colors">
              Buscar
            </button>
          </form>

          <div className="flex gap-2">
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="h-9 px-3 rounded-lg border border-black/20 text-sm bg-white focus:outline-none focus:border-black transition-colors"
            >
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="h-9 px-3 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-black transition-colors"
              title="Data início"
            />
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="h-9 px-3 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-black transition-colors"
              title="Data fim"
            />
          </div>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="rounded-xl border border-black/8 bg-white p-8 text-center">
          <p className="text-sm text-[#606060]">Carregando...</p>
        </div>
      ) : propostas.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhuma proposta encontrada" description="Crie propostas a partir da aba de um terreno." />
      ) : (
        <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/8 bg-[#F7F7F7]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#606060]">Terreno</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#606060]">Versão</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#606060]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#606060]">Valor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#606060]">Pagamento</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#606060]">Validade</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#606060]">Responsável</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {propostas.map((p, i) => {
                const expirando = p.validade && new Date(p.validade).getTime() - Date.now() < 5 * 86400000 && new Date(p.validade).getTime() > Date.now();
                return (
                  <tr key={p.id} className={`border-b border-black/6 last:border-0 hover:bg-[#F7F7F7] transition-colors ${i % 2 === 0 ? "" : ""}`}>
                    <td className="px-4 py-3">
                      <Link href={`/terrenos/${p.terreno?.id}`} className="font-medium text-black hover:text-[#F26522] transition-colors">
                        {p.terreno?.nome}
                      </Link>
                      <p className="text-xs text-[#606060]">{p.terreno?.cidade}/{p.terreno?.uf}</p>
                    </td>
                    <td className="px-4 py-3 text-[#606060]">v{p.versao}</td>
                    <td className="px-4 py-3">
                      <PropostaStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(p.valorProposto)}</td>
                    <td className="px-4 py-3 text-[#606060] text-xs">
                      {p.formaPagamento ? FORMA_PAGAMENTO_LABELS[p.formaPagamento as keyof typeof FORMA_PAGAMENTO_LABELS] : "—"}
                    </td>
                    <td className={`px-4 py-3 text-xs ${expirando ? "text-[#c2410c] font-medium" : "text-[#606060]"}`}>
                      {formatDate(p.validade)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#606060]">
                      {p.terreno?.responsavel?.nome ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/propostas/${p.id}`}
                        className="flex items-center gap-1 text-xs text-[#606060] hover:text-black transition-colors whitespace-nowrap"
                      >
                        Ver <ExternalLink size={11} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
