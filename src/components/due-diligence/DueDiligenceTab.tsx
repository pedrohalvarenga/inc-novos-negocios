"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Loader2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { z } from "zod";
import ChecklistItems from "./ChecklistItems";
import ScorePanel from "./ScorePanel";
import DueDiligenceForm from "./DueDiligenceForm";
import EmptyState from "@/components/common/EmptyState";
import AnaliseHibridaModal from "@/components/comum/AnaliseHibridaModal";
import { StatusBadge as ChecklistBadge } from "./ChecklistItems";
import { formatDate } from "@/lib/formatters";
import type { ItemChecklist } from "./ChecklistItems";

const SchemaParecer = z.object({
  score: z.number().min(0).max(100),
  resumoRiscos: z.string(),
  alertaFraude: z.boolean(),
  motivoAlertaFraude: z.string().optional().nullable(),
  recomendacoes: z.array(z.string()).optional(),
  podeProsseguir: z.enum(["SIM", "COM_RESSALVAS", "NAO"]),
  justificativaProsseguir: z.string().optional().nullable(),
});

interface Props {
  terrenoId: string;
}

export default function DueDiligenceTab({ terrenoId }: Props) {
  const [dueDiligences, setDueDiligences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [gerandoParecer, setGerandoParecer] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [modalHibrido, setModalHibrido] = useState<{ ddId: string; prompt: string } | null>(null);

  async function carregar() {
    setLoading(true);
    const res = await fetch(`/api/due-diligence?terrenoId=${terrenoId}`);
    const data = await res.json();
    setDueDiligences(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [terrenoId]);

  async function salvarChecklist(ddId: string, checklist: ItemChecklist[]) {
    setSalvando(ddId);
    const res = await fetch(`/api/due-diligence/${ddId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checklist }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDueDiligences((prev) => prev.map((dd) => dd.id === ddId ? { ...dd, checklist: updated.checklist } : dd));
    }
    setSalvando(null);
  }

  async function gerarParecer(ddId: string) {
    setGerandoParecer(ddId);
    try {
      const res = await fetch(`/api/due-diligence/${ddId}/analisar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.modoHibrido) {
        setModalHibrido({ ddId, prompt: data.prompt });
      } else if (res.ok) {
        await carregar();
      }
    } finally {
      setGerandoParecer(null);
    }
  }

  async function salvarRespostaHibridaDD(dados: unknown) {
    if (!modalHibrido) return;
    const res = await fetch(`/api/due-diligence/${modalHibrido.ddId}/analisar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respostaManual: JSON.stringify(dados) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Erro ao salvar parecer");
    setModalHibrido(null);
    await carregar();
  }

  if (loading) return <div className="p-6 animate-pulse space-y-3"><div className="h-6 w-48 bg-gray-100 rounded" /><div className="h-40 bg-gray-100 rounded-xl" /></div>;

  return (
    <div className="space-y-4">
      {modalHibrido && (
        <AnaliseHibridaModal
          titulo="Parecer de Due Diligence"
          descricao="Gere o parecer de risco do vendedor com o Claude e cole o JSON abaixo"
          prompt={modalHibrido.prompt}
          schema={SchemaParecer}
          onConfirmar={salvarRespostaHibridaDD}
          onFechar={() => setModalHibrido(null)}
        />
      )}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-black">Due Diligence de Vendedores</h3>
        <button
          onClick={() => setCriando(true)}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#FF7924] text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
        >
          <Plus size={14} /> Nova DD
        </button>
      </div>

      {/* Formulário de criação */}
      {criando && (
        <div className="rounded-xl border border-[#FF7924]/30 bg-orange-50 p-5">
          <h4 className="text-sm font-semibold text-black mb-4">Nova Due Diligence</h4>
          <DueDiligenceForm
            terrenoId={terrenoId}
            onCriado={() => { setCriando(false); carregar(); }}
            onCancelar={() => setCriando(false)}
          />
        </div>
      )}

      {dueDiligences.length === 0 && !criando ? (
        <EmptyState
          icon={Users}
          title="Nenhuma due diligence realizada"
          description="Clique em 'Nova DD' para iniciar a verificação de risco dos vendedores deste terreno."
        />
      ) : (
        <div className="space-y-3">
          {dueDiligences.map((dd) => {
            const aberto = expandido === dd.id;
            const checklist = (dd.checklist ?? []) as ItemChecklist[];
            const criticos = checklist.filter((c) => c.status === "CRITICO").length;
            const alertas = checklist.filter((c) => c.status === "ALERTA").length;
            const pendentes = checklist.filter((c) => c.status === "PENDENTE").length;
            const parecer = (dd.resultado as any)?.parecer;

            return (
              <div key={dd.id} className="rounded-xl border border-black/8 bg-white overflow-hidden">
                {/* Header do card */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#F7F7F7] transition-colors"
                  onClick={() => setExpandido(aberto ? null : dd.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-black">{dd.proprietario.nomeRazaoSocial}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#F7F7F7] border border-black/10 font-medium text-[#606060]">{dd.tipo}</span>
                      {criticos > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 border border-red-200 font-semibold text-red-700">{criticos} CRÍTICO(s)</span>}
                      {alertas > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 border border-yellow-200 font-semibold text-yellow-700">{alertas} alerta(s)</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#A0A0A0]">
                      {dd.proprietario.cpfCnpj && <span>{dd.proprietario.cpfCnpj}</span>}
                      {dd.score !== null && dd.score !== undefined && (
                        <span className={`font-semibold ${dd.score >= 70 ? "text-green-600" : dd.score >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                          Score: {Math.round(dd.score)}/100
                        </span>
                      )}
                      <span>{pendentes} pendente(s)</span>
                      <span>Atualizado em {formatDate(dd.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!aberto && (
                      <button
                        onClick={(e) => { e.stopPropagation(); gerarParecer(dd.id); }}
                        disabled={gerandoParecer === dd.id}
                        className="flex items-center gap-1 h-8 px-3 rounded-lg border border-black/20 text-xs font-medium text-black hover:bg-[#F7F7F7] transition-colors"
                      >
                        {gerandoParecer === dd.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        Parecer IA
                      </button>
                    )}
                    {aberto ? <ChevronUp size={16} className="text-[#606060]" /> : <ChevronDown size={16} className="text-[#606060]" />}
                  </div>
                </div>

                {/* Conteúdo expandido */}
                {aberto && (
                  <div className="px-5 pb-5 border-t border-black/6 space-y-6">
                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-black">Checklist de Verificação</h4>
                        {salvando === dd.id && (
                          <span className="text-xs text-[#606060] flex items-center gap-1">
                            <Loader2 size={11} className="animate-spin" /> Salvando...
                          </span>
                        )}
                      </div>
                      <ChecklistItems
                        checklist={checklist}
                        onChange={(novo) => salvarChecklist(dd.id, novo)}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-black">Parecer e Score de Risco</h4>
                        <button
                          onClick={() => gerarParecer(dd.id)}
                          disabled={gerandoParecer === dd.id}
                          className="flex items-center gap-1 h-8 px-3 rounded-lg border border-black/20 text-xs font-medium text-black hover:bg-[#F7F7F7] transition-colors disabled:opacity-50"
                        >
                          {gerandoParecer === dd.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                          {parecer ? "Regenerar Parecer" : "Gerar Parecer com IA"}
                        </button>
                      </div>
                      <ScorePanel score={dd.score} resumo={dd.resumo} parecer={parecer} />
                    </div>
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
