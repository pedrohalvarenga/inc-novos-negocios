"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Search, Download } from "lucide-react";
import { RiscoBadge } from "./MatriculaRiscos";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import { formatDate } from "@/lib/formatters";
import Link from "next/link";

export default function MatriculasContent() {
  const [matriculas, setMatriculas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetch("/api/matriculas")
      .then((r) => r.json())
      .then((data) => { setMatriculas(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const filtradas = matriculas.filter((m) =>
    !busca ||
    m.numero?.toLowerCase().includes(busca.toLowerCase()) ||
    m.terreno?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    m.cartorio?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-8">
      <PageHeader
        title="Matrículas"
        description="Análise de matrículas imobiliárias por IA"
      />

      {/* Barra de busca */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606060]" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por terreno, número ou cartório..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-black/20 text-sm outline-none focus:border-[#FF7924] bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtradas.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma matrícula encontrada"
          description="As análises de matrícula são criadas na aba 'Matrícula & DD' de cada terreno."
        />
      ) : (
        <div className="space-y-3">
          {filtradas.map((m) => (
            <div key={m.id} className="rounded-xl border border-black/8 bg-white p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Link
                    href={`/terrenos/${m.terrenoId}`}
                    className="text-sm font-semibold text-black hover:text-[#FF7924] transition-colors"
                  >
                    {m.terreno?.nome ?? "Terreno"}
                  </Link>
                  <span className="text-xs text-[#606060]">·</span>
                  <span className="text-sm text-[#606060]">{m.numero ? `Matrícula nº ${m.numero}` : "Sem número"}</span>
                  {m.riscoOnus && <RiscoBadge risco={m.riscoOnus} />}
                </div>
                {m.cartorio && <p className="text-xs text-[#606060]">{m.cartorio}{m.comarca ? ` — ${m.comarca}` : ""}</p>}
                <p className="text-xs text-[#A0A0A0] mt-1">
                  {m.terreno?.cidade}/{m.terreno?.uf} · Atualizado em {formatDate(m.updatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {m.dadosExtraidos && (
                  <button
                    onClick={() => window.open(`/api/matriculas/${m.id}/pdf`, "_blank")}
                    className="flex items-center gap-1 h-8 px-3 rounded-lg border border-black/20 text-xs font-medium text-black hover:bg-[#F7F7F7] transition-colors"
                  >
                    <Download size={12} /> PDF
                  </button>
                )}
                <Link
                  href={`/terrenos/${m.terrenoId}?tab=matricula`}
                  className="flex items-center gap-1 h-8 px-3 rounded-lg bg-[#F7F7F7] text-xs font-medium text-black hover:bg-black/10 transition-colors"
                >
                  Ver detalhe
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
