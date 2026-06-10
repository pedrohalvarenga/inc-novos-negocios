"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, FileText, ExternalLink } from "lucide-react";
import ContratoStatusBadge from "./ContratoStatusBadge";
import { formatDate } from "@/lib/formatters";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "MINUTA", label: "Minuta" },
  { value: "EM_REVISAO", label: "Em Revisão" },
  { value: "ANALISE_JURIDICA", label: "Análise Jurídica" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "ASSINADO", label: "Assinado" },
  { value: "RESCINDIDO", label: "Rescindido" },
];

export default function ContratosContent() {
  const [contratos, setContratos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");

  async function carregar() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFiltro) params.set("status", statusFiltro);
    if (busca) params.set("busca", busca);
    const data = await fetch(`/api/contratos?${params}`).then((r) => r.json());
    setContratos(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [statusFiltro]);

  function handleBusca(e: React.FormEvent) {
    e.preventDefault();
    carregar();
  }

  // KPIs
  const total = contratos.length;
  const emElaboracao = contratos.filter((c) => ["MINUTA", "EM_REVISAO", "ANALISE_JURIDICA"].includes(c.status)).length;
  const aprovados = contratos.filter((c) => c.status === "APROVADO").length;
  const assinados = contratos.filter((c) => c.status === "ASSINADO").length;

  return (
    <div className="p-8">
      <PageHeader title="Contratos" description="Minutas e contratos de aquisição de terrenos" />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: total.toString() },
          { label: "Em Elaboração", value: emElaboracao.toString() },
          { label: "Aprovados", value: aprovados.toString() },
          { label: "Assinados", value: assinados.toString() },
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
            <button type="submit" className="h-9 px-4 rounded-lg bg-black text-white text-sm font-medium hover:bg-[#222]">
              Buscar
            </button>
          </form>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="h-9 px-3 rounded-lg border border-black/20 text-sm bg-white focus:outline-none focus:border-black"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="rounded-xl border border-black/8 bg-white p-8 text-center">
          <p className="text-sm text-[#606060]">Carregando...</p>
        </div>
      ) : contratos.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum contrato encontrado" description="Contratos são criados a partir de propostas aceitas." />
      ) : (
        <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/8 bg-[#F7F7F7]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#606060]">Terreno</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#606060]">Versão</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#606060]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#606060]">Vendedor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#606060]">Assinatura</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#606060]">Responsável</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.id} className="border-b border-black/6 last:border-0 hover:bg-[#F7F7F7] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/terrenos/${c.terreno?.id}`} className="font-medium text-black hover:text-[#F26522] transition-colors">
                      {c.terreno?.nome}
                    </Link>
                    <p className="text-xs text-[#606060]">{c.terreno?.cidade}/{c.terreno?.uf}</p>
                  </td>
                  <td className="px-4 py-3 text-[#606060]">v{c.versao}</td>
                  <td className="px-4 py-3">
                    <ContratoStatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-[#606060]">
                    {c.terreno?.proprietarios?.[0]?.proprietario?.nomeRazaoSocial ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#606060]">{formatDate(c.dataAssinatura)}</td>
                  <td className="px-4 py-3 text-xs text-[#606060]">{c.terreno?.responsavel?.nome ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/contratos/${c.id}`}
                      className="flex items-center gap-1 text-xs text-[#606060] hover:text-black transition-colors"
                    >
                      Editar <ExternalLink size={11} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
