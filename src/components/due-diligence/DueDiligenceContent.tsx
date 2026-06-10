"use client";

import { useEffect, useState } from "react";
import { Users, Search, Settings } from "lucide-react";
import ScorePanel from "./ScorePanel";
import { StatusBadge as ChecklistBadge } from "./ChecklistItems";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import { formatDate } from "@/lib/formatters";
import Link from "next/link";
import type { ItemChecklist } from "./ChecklistItems";

type Filtro = "TODOS" | "CRITICO" | "ALERTA" | "PENDENTE" | "OK";

export default function DueDiligenceContent() {
  const [dueDiligences, setDueDiligences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("TODOS");

  useEffect(() => {
    fetch("/api/due-diligence")
      .then((r) => r.json())
      .then((data) => { setDueDiligences(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const filtradas = dueDiligences.filter((dd) => {
    const matchBusca = !busca ||
      dd.proprietario?.nomeRazaoSocial?.toLowerCase().includes(busca.toLowerCase()) ||
      dd.terreno?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      dd.proprietario?.cpfCnpj?.includes(busca);

    if (!matchBusca) return false;
    if (filtro === "TODOS") return true;

    const checklist = (dd.checklist ?? []) as ItemChecklist[];
    if (filtro === "CRITICO") return checklist.some((c) => c.status === "CRITICO");
    if (filtro === "ALERTA") return checklist.some((c) => c.status === "ALERTA");
    if (filtro === "PENDENTE") return checklist.some((c) => c.status === "PENDENTE");
    if (filtro === "OK") return checklist.every((c) => c.status === "OK");
    return true;
  });

  const FILTROS: { key: Filtro; label: string }[] = [
    { key: "TODOS", label: "Todos" },
    { key: "CRITICO", label: "Com críticos" },
    { key: "ALERTA", label: "Com alertas" },
    { key: "PENDENTE", label: "Com pendentes" },
    { key: "OK", label: "Todos OK" },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Due Diligence"
        description="Análise de risco de vendedores e proprietários"
        actions={
          <Link
            href="/due-diligence/configuracoes"
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-black/20 text-sm font-medium text-black hover:bg-[#F7F7F7] transition-colors"
          >
            <Settings size={14} /> Configurações
          </Link>
        }
      />

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606060]" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar vendedor ou terreno..."
            className="h-9 pl-9 pr-4 rounded-xl border border-black/20 text-sm outline-none focus:border-[#FF7924] bg-white w-64"
          />
        </div>
        <div className="flex gap-1">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`h-9 px-3 rounded-lg text-sm font-medium transition-colors ${filtro === f.key ? "bg-[#FF7924] text-white" : "bg-white border border-black/20 text-black hover:bg-[#F7F7F7]"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : filtradas.length === 0 ? (
        <EmptyState icon={Users} title="Nenhuma due diligence encontrada" description="As due diligences são criadas na aba 'Matrícula & DD' de cada terreno." />
      ) : (
        <div className="space-y-3">
          {filtradas.map((dd) => {
            const checklist = (dd.checklist ?? []) as ItemChecklist[];
            const criticos = checklist.filter((c) => c.status === "CRITICO").length;
            const alertas = checklist.filter((c) => c.status === "ALERTA").length;
            const parecer = (dd.resultado as any)?.parecer;

            return (
              <div key={dd.id} className="rounded-xl border border-black/8 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-black">{dd.proprietario.nomeRazaoSocial}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#F7F7F7] border border-black/10 font-medium text-[#606060]">{dd.tipo}</span>
                      {criticos > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 border border-red-200 font-semibold text-red-700">{criticos} CRÍTICO(s)</span>}
                      {alertas > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 border border-yellow-200 font-semibold text-yellow-700">{alertas} alerta(s)</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#A0A0A0]">
                      {dd.proprietario.cpfCnpj && <span>{dd.proprietario.cpfCnpj}</span>}
                      {dd.terreno && <span>Terreno: {dd.terreno.nome} — {dd.terreno.cidade}/{dd.terreno.uf}</span>}
                      {dd.score !== null && dd.score !== undefined && (
                        <span className={`font-semibold ${dd.score >= 70 ? "text-green-600" : dd.score >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                          Score: {Math.round(dd.score)}/100
                        </span>
                      )}
                      <span>Atualizado em {formatDate(dd.updatedAt)}</span>
                    </div>
                    {dd.resumo && <p className="text-xs text-[#606060] mt-2 line-clamp-2">{dd.resumo}</p>}
                  </div>
                  {dd.terrenoId && (
                    <Link
                      href={`/terrenos/${dd.terrenoId}?tab=matricula`}
                      className="flex items-center h-8 px-3 rounded-lg bg-[#F7F7F7] text-xs font-medium text-black hover:bg-black/10 transition-colors shrink-0"
                    >
                      Ver terreno
                    </Link>
                  )}
                </div>

                {parecer?.alertaFraude && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-bold text-red-700">⚠️ Alerta de fraude contra credores</p>
                    {parecer.motivoAlertaFraude && <p className="text-xs text-red-600 mt-0.5">{parecer.motivoAlertaFraude}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
