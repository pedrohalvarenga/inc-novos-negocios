"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft, Loader2, Save, Scale, Printer, CheckCircle,
  AlertTriangle, Clock, History, ChevronDown, Shield,
} from "lucide-react";
import Link from "next/link";
import ContratoStatusBadge from "./ContratoStatusBadge";
import AnaliseJuridicaPanel from "./AnaliseJuridicaPanel";
import AnaliseHibridaModal from "@/components/comum/AnaliseHibridaModal";
import { CLAUSULAS_ORDEM, CLAUSULAS_IMPORTANTES, type Clausula, type ClausulasContrato, type AnaliseClausula } from "@/lib/contratos/template";
import { formatDate, formatDateTime } from "@/lib/formatters";
import { gerarHtmlContrato } from "@/lib/contratos/pdf";
import { cn } from "@/lib/utils";
import { z } from "zod";
import type { StatusContrato } from "@prisma/client";

const RISCO_COR: Record<string, string> = {
  BAIXO: "#D1FAE5",
  MEDIO: "#FEF3C7",
  ALTO:  "#FEE2E2",
};

const STATUS_TRANSICOES: Record<string, { proximo: StatusContrato; label: string }[]> = {
  MINUTA:           [{ proximo: "EM_REVISAO", label: "Enviar para Revisão" }],
  EM_REVISAO:       [{ proximo: "ANALISE_JURIDICA", label: "Enviar para Análise Jurídica" }, { proximo: "MINUTA", label: "Voltar para Minuta" }],
  ANALISE_JURIDICA: [{ proximo: "APROVADO", label: "Aprovar" }, { proximo: "EM_REVISAO", label: "Devolver para Revisão" }],
  APROVADO:         [{ proximo: "ASSINADO", label: "Marcar como Assinado" }],
  ASSINADO:         [],
  RESCINDIDO:       [],
};

interface Props {
  contratoId: string;
  usuarioNome: string;
  usuarioRole: string;
}

export default function ContratoEditor({ contratoId, usuarioNome, usuarioRole }: Props) {
  const [contrato, setContrato] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clausulaAtiva, setClausulaAtiva] = useState<string>("partes");
  const [conteudoEditado, setConteudoEditado] = useState<string>("");
  const [justificativa, setJustificativa] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [analisando, setAnalisando] = useState(false);
  const [mudandoStatus, setMudandoStatus] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState<StatusContrato | null>(null);
  const [dataAssinatura, setDataAssinatura] = useState("");
  const [analiseCompleta, setAnaliseCompleta] = useState<any>(null);
  const [analisandoCompleto, setAnalisandoCompleto] = useState(false);
  const [modalHibrido, setModalHibrido] = useState<{ prompt: string; clausulaKey?: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const SchemaClausula = z.object({
    risco: z.enum(["BAIXO", "MEDIO", "ALTO"]),
    explicacao: z.string(),
    sugestao: z.string().optional(),
    dicasNegociacao: z.string().optional(),
  });

  const SchemaCompleto = z.object({
    resumoGeral: z.string(),
    clausulasAusentes: z.array(z.object({ nome: z.string(), importancia: z.string(), sugestaoTexto: z.string().optional() })).optional(),
    principaisRiscos: z.array(z.object({ clausula: z.string(), risco: z.enum(["BAIXO", "MEDIO", "ALTO"]), descricao: z.string() })).optional(),
    recomendacao: z.string().optional(),
  });

  const podeAprovar = ["ADMIN", "GESTOR"].includes(usuarioRole);

  const carregar = useCallback(async () => {
    const data = await fetch(`/api/contratos/${contratoId}`).then((r) => r.json());
    setContrato(data);
    setLoading(false);
  }, [contratoId]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (contrato?.clausulas?.[clausulaAtiva]) {
      setConteudoEditado(contrato.clausulas[clausulaAtiva].conteudo ?? "");
      setJustificativa("");
    }
  }, [clausulaAtiva, contrato]);

  const clausulas: ClausulasContrato = contrato?.clausulas ?? {};
  const clausulaAtivaObj: Clausula | undefined = clausulas[clausulaAtiva];

  async function salvarClausula() {
    if (!clausulaAtivaObj) return;
    setSalvando(true);
    try {
      const res = await fetch(`/api/contratos/${contratoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clausulaKey: clausulaAtiva,
          conteudo: conteudoEditado,
          justificativa,
          autorNome: usuarioNome,
        }),
      });
      if (res.ok) {
        await carregar();
        // Dispara análise automática com debounce
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => analisarClausula(clausulaAtiva), 1000);
      }
    } finally {
      setSalvando(false);
    }
  }

  async function analisarClausula(key = clausulaAtiva) {
    setAnalisando(true);
    try {
      const res = await fetch(`/api/contratos/${contratoId}/analisar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clausulaKey: key }),
      });
      const data = await res.json();
      if (data.modoHibrido) {
        setModalHibrido({ prompt: data.prompt, clausulaKey: key });
      } else if (res.ok) {
        await carregar();
      }
    } finally {
      setAnalisando(false);
    }
  }

  async function analisarContrato() {
    setAnalisandoCompleto(true);
    try {
      const res = await fetch(`/api/contratos/${contratoId}/analisar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.modoHibrido) {
        setModalHibrido({ prompt: data.prompt });
      } else if (res.ok) {
        setAnaliseCompleta(data.analise);
      }
    } finally {
      setAnalisandoCompleto(false);
    }
  }

  async function salvarRespostaHibrida(dados: unknown) {
    const body = modalHibrido?.clausulaKey
      ? { clausulaKey: modalHibrido.clausulaKey, respostaManual: JSON.stringify(dados) }
      : { respostaManual: JSON.stringify(dados) };
    const res = await fetch(`/api/contratos/${contratoId}/analisar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const respData = await res.json();
    if (!res.ok) throw new Error(respData.error ?? "Erro ao salvar");
    if (modalHibrido?.clausulaKey) {
      await carregar();
    } else {
      setAnaliseCompleta(respData.analise);
    }
    setModalHibrido(null);
  }

  async function mudarStatus(status: StatusContrato) {
    if (["APROVADO", "ASSINADO"].includes(status) && !podeAprovar) return;
    setMudandoStatus(true);
    try {
      const res = await fetch(`/api/contratos/${contratoId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          dataAssinatura: status === "ASSINADO" && dataAssinatura ? dataAssinatura : null,
        }),
      });
      if (res.ok) await carregar();
    } finally {
      setMudandoStatus(false);
      setShowStatusModal(null);
    }
  }

  function imprimirContrato() {
    if (!contrato) return;
    const html = gerarHtmlContrato({
      terreno: contrato.terreno,
      contrato: { versao: contrato.versao, status: contrato.status, dataAssinatura: contrato.dataAssinatura, observacoes: contrato.observacoes },
      clausulas: clausulas,
      dataEmissao: new Date(),
    });
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  }

  function getRiscoClausula(key: string): string | null {
    return clausulas[key]?.analise?.risco ?? null;
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 size={24} className="animate-spin text-[#606060]" />
      </div>
    );
  }

  if (!contrato || contrato.error) {
    return <div className="p-8"><p className="text-sm text-[#606060]">Contrato não encontrado.</p></div>;
  }

  const transicoes = STATUS_TRANSICOES[contrato.status] ?? [];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-black/8 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/terrenos/${contrato.terrenoId}`}
              className="flex items-center gap-1 text-sm text-[#606060] hover:text-black transition-colors shrink-0"
            >
              <ChevronLeft size={15} />
              {contrato.terreno?.nome}
            </Link>
            <span className="text-[#E5E5E5]">/</span>
            <span className="text-sm font-medium text-black truncate">Contrato v{contrato.versao}</span>
            <ContratoStatusBadge status={contrato.status} />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Análise completa */}
            <button
              onClick={analisarContrato}
              disabled={analisandoCompleto}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-black/20 text-xs font-medium text-[#606060] hover:bg-[#F7F7F7] transition-colors"
            >
              {analisandoCompleto ? <Loader2 size={12} className="animate-spin" /> : <Scale size={12} />}
              Analisar Contrato
            </button>

            {/* PDF */}
            <button
              onClick={imprimirContrato}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-black/20 text-xs font-medium text-[#606060] hover:bg-[#F7F7F7] transition-colors"
            >
              <Printer size={12} />
              PDF
            </button>

            {/* Transições de status */}
            {transicoes.map((t) => {
              const restrito = ["APROVADO", "ASSINADO"].includes(t.proximo) && !podeAprovar;
              return (
                <button
                  key={t.proximo}
                  onClick={() => restrito ? null : (t.proximo === "ASSINADO" ? setShowStatusModal(t.proximo) : mudarStatus(t.proximo))}
                  disabled={mudandoStatus || restrito}
                  title={restrito ? "Apenas Gestor ou Admin" : t.label}
                  className={cn(
                    "flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors",
                    restrito
                      ? "border border-black/10 text-[#A0A0A0] cursor-not-allowed"
                      : t.proximo === "ASSINADO"
                        ? "bg-black text-white hover:bg-[#222]"
                        : t.proximo === "APROVADO"
                          ? "bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]"
                          : "border border-black/20 text-[#606060] hover:bg-[#F7F7F7]"
                  )}
                >
                  {mudandoStatus ? <Loader2 size={12} className="animate-spin" /> : null}
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex gap-0">
        {/* Sidebar de cláusulas */}
        <aside className="w-60 shrink-0 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto bg-white border-r border-black/8">
          <div className="p-4">
            <p className="text-xs font-semibold text-[#606060] mb-3 uppercase tracking-wide">Cláusulas</p>
            <div className="space-y-0.5">
              {CLAUSULAS_ORDEM.filter((k) => clausulas[k]).map((key) => {
                const c = clausulas[key];
                const risco = getRiscoClausula(key);
                const importante = CLAUSULAS_IMPORTANTES.includes(key);
                const temHistorico = (c?.historico ?? []).length > 0;
                return (
                  <button
                    key={key}
                    onClick={() => { setClausulaAtiva(key); setShowHistorico(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors group relative",
                      clausulaAtiva === key
                        ? "bg-black text-white"
                        : "text-[#606060] hover:bg-[#F7F7F7] hover:text-black"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="line-clamp-2 leading-relaxed">{c?.titulo ?? key}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {importante && clausulaAtiva !== key && (
                          <span title="Cláusula importante"><Shield size={10} className="text-[#A0A0A0]" /></span>
                        )}
                        {temHistorico && (
                          <span title="Editada"><History size={10} className={clausulaAtiva === key ? "text-white/60" : "text-[#A0A0A0]"} /></span>
                        )}
                        {risco && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: RISCO_COR[risco] ?? "#F3F4F6" }}
                            title={`Risco ${risco}`}
                          />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info do contrato */}
          <div className="p-4 border-t border-black/8">
            <p className="text-[10px] text-[#A0A0A0] mb-1">Dados do contrato</p>
            {contrato.dataAssinatura && (
              <p className="text-xs text-[#606060]">Assinado: {formatDate(contrato.dataAssinatura)}</p>
            )}
            <p className="text-xs text-[#606060]">Atualizado: {formatDateTime(contrato.updatedAt)}</p>
            {contrato.proposta && (
              <p className="text-xs text-[#606060]">Proposta: v{contrato.proposta.versao}</p>
            )}
          </div>
        </aside>

        {/* Editor principal */}
        <main className="flex-1 p-6 min-w-0">
          {clausulaAtivaObj ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Editor */}
              <div className="lg:col-span-2 space-y-4">
                {/* Título da cláusula */}
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-black">{clausulaAtivaObj.titulo}</h2>
                  {CLAUSULAS_IMPORTANTES.includes(clausulaAtiva) && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-[#F26522] bg-[#FFF0E8] px-2 py-0.5 rounded-full">
                      <Shield size={9} />
                      Cláusula Importante
                    </span>
                  )}
                </div>

                {/* Textarea de edição */}
                <div className="rounded-xl border border-black/20 overflow-hidden">
                  <div className="bg-[#F7F7F7] border-b border-black/8 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs text-[#606060]">Texto da cláusula</span>
                    {(clausulaAtivaObj.historico ?? []).length > 0 && (
                      <button
                        onClick={() => setShowHistorico(!showHistorico)}
                        className="flex items-center gap-1 text-[10px] text-[#606060] hover:text-black transition-colors"
                      >
                        <History size={10} />
                        {(clausulaAtivaObj.historico ?? []).length} versão(ões)
                        <ChevronDown size={10} className={cn("transition-transform", showHistorico && "rotate-180")} />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={conteudoEditado}
                    onChange={(e) => setConteudoEditado(e.target.value)}
                    disabled={contrato.status === "ASSINADO" || contrato.status === "RESCINDIDO"}
                    rows={16}
                    className="w-full px-4 py-3 text-sm text-black leading-relaxed focus:outline-none resize-y disabled:bg-[#F7F7F7] disabled:text-[#606060]"
                    style={{ fontFamily: "Georgia, serif" }}
                  />
                </div>

                {/* Justificativa */}
                {contrato.status !== "ASSINADO" && contrato.status !== "RESCINDIDO" && (
                  <div>
                    <label className="block text-xs font-medium text-[#606060] mb-1.5">
                      Justificativa da alteração <span className="text-[#A0A0A0]">(opcional)</span>
                    </label>
                    <input
                      value={justificativa}
                      onChange={(e) => setJustificativa(e.target.value)}
                      placeholder="Ex: Ajustado prazo a pedido do vendedor..."
                      className="w-full h-9 px-3 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                )}

                {/* Botão salvar */}
                {contrato.status !== "ASSINADO" && contrato.status !== "RESCINDIDO" && (
                  <div className="flex gap-3">
                    <button
                      onClick={salvarClausula}
                      disabled={salvando || conteudoEditado === clausulaAtivaObj.conteudo}
                      className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-black text-white text-sm font-medium hover:bg-[#222] transition-colors disabled:opacity-50"
                    >
                      {salvando ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      Salvar Alterações
                    </button>
                    {conteudoEditado !== clausulaAtivaObj.conteudo && (
                      <button
                        onClick={() => setConteudoEditado(clausulaAtivaObj.conteudo)}
                        className="h-9 px-4 rounded-lg border border-black/20 text-sm font-medium text-[#606060] hover:bg-[#F7F7F7] transition-colors"
                      >
                        Descartar
                      </button>
                    )}
                  </div>
                )}

                {/* Histórico de versões */}
                {showHistorico && (clausulaAtivaObj.historico ?? []).length > 0 && (
                  <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
                    <div className="bg-[#F7F7F7] px-4 py-2 border-b border-black/8">
                      <p className="text-xs font-semibold text-[#606060]">Histórico de Alterações</p>
                    </div>
                    <div className="divide-y divide-black/6">
                      {[...clausulaAtivaObj.historico].reverse().map((h, i) => (
                        <div key={i} className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-black">{h.autor}</span>
                            <span className="text-[10px] text-[#A0A0A0]">{formatDateTime(h.data)}</span>
                          </div>
                          {h.justificativa && (
                            <p className="text-xs text-[#606060] italic">"{h.justificativa}"</p>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded bg-[#FEE2E2] p-2">
                              <p className="text-[10px] font-medium text-[#991B1B] mb-1">Anterior</p>
                              <p className="text-[#606060] line-clamp-3 whitespace-pre-wrap">{h.conteudoAnterior}</p>
                            </div>
                            <div className="rounded bg-[#D1FAE5] p-2">
                              <p className="text-[10px] font-medium text-[#065F46] mb-1">Novo</p>
                              <p className="text-[#606060] line-clamp-3 whitespace-pre-wrap">{h.conteudoNovo}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Painel lateral IA */}
              <div className="space-y-4">
                <AnaliseJuridicaPanel
                  analise={clausulaAtivaObj.analise as AnaliseClausula | null}
                  analisando={analisando}
                  clausulaTitulo={clausulaAtivaObj.titulo}
                  onAnalisar={() => analisarClausula()}
                />

                {/* Disclaimer fixo */}
                <div className="rounded-lg border border-[#F26522]/30 bg-[#FFF8F5] p-3">
                  <p className="text-[10px] text-[#c2410c] leading-relaxed">
                    ⚠️ <strong>Análise gerada por IA como apoio.</strong> Não substitui a revisão do departamento jurídico da INC Empreendimentos.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-[#606060]">Selecione uma cláusula para editar</p>
            </div>
          )}

          {/* Análise completa do contrato */}
          {analiseCompleta && (
            <div className="mt-8 rounded-xl border border-black/8 bg-white overflow-hidden">
              <div className="bg-[#F7F7F7] px-6 py-4 border-b border-black/8 flex items-center gap-2">
                <Scale size={15} className="text-[#606060]" />
                <h3 className="text-sm font-semibold text-black">Análise Completa do Contrato</h3>
              </div>
              <div className="p-6 space-y-6">
                {analiseCompleta.resumoGeral && (
                  <div>
                    <h4 className="text-xs font-semibold text-[#606060] mb-2 uppercase tracking-wide">Resumo Geral</h4>
                    <p className="text-sm text-black leading-relaxed">{analiseCompleta.resumoGeral}</p>
                  </div>
                )}

                {analiseCompleta.principaisRiscos?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-[#606060] mb-3 uppercase tracking-wide">Principais Riscos</h4>
                    <div className="space-y-2">
                      {analiseCompleta.principaisRiscos.map((r: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: RISCO_COR[r.risco] ?? "#F3F4F6" }}>
                          <AlertTriangle size={13} className="shrink-0 mt-0.5 text-[#92400E]" />
                          <div>
                            <p className="text-xs font-medium text-black">{r.clausula}</p>
                            <p className="text-xs text-[#606060] mt-0.5">{r.descricao}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analiseCompleta.clausulasAusentes?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-[#606060] mb-3 uppercase tracking-wide">Cláusulas Ausentes Importantes</h4>
                    <div className="space-y-3">
                      {analiseCompleta.clausulasAusentes.map((ca: any, i: number) => (
                        <div key={i} className="rounded-lg border border-[#FDE68A] bg-[#FEF3C7] p-4">
                          <p className="text-xs font-semibold text-[#92400E]">{ca.nome}</p>
                          <p className="text-xs text-[#606060] mt-1">{ca.importancia}</p>
                          {ca.sugestaoTexto && (
                            <p className="text-xs text-[#606060] mt-2 italic">"{ca.sugestaoTexto}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analiseCompleta.recomendacao && (
                  <div className="rounded-lg border border-black/8 bg-[#F7F7F7] p-4">
                    <p className="text-xs font-semibold text-[#606060] mb-1">Recomendação</p>
                    <p className="text-sm text-black">{analiseCompleta.recomendacao}</p>
                  </div>
                )}

                <div className="rounded-lg border border-[#F26522]/30 bg-[#FFF8F5] p-3">
                  <p className="text-[10px] text-[#c2410c]">
                    ⚠️ Análise gerada por IA como apoio. Não substitui a revisão do departamento jurídico.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: modo híbrido IA */}
      {modalHibrido && (
        <AnaliseHibridaModal
          titulo={modalHibrido.clausulaKey ? "Análise Jurídica da Cláusula" : "Análise Completa do Contrato"}
          descricao={modalHibrido.clausulaKey ? `Cláusula: ${clausulas[modalHibrido.clausulaKey]?.titulo ?? modalHibrido.clausulaKey}` : "Análise de todas as cláusulas"}
          prompt={modalHibrido.prompt}
          schema={modalHibrido.clausulaKey ? SchemaClausula : SchemaCompleto}
          onConfirmar={salvarRespostaHibrida}
          onFechar={() => setModalHibrido(null)}
        />
      )}

      {/* Modal: confirmar assinatura */}
      {showStatusModal === "ASSINADO" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <h3 className="text-sm font-semibold text-black mb-1">Marcar como Assinado</h3>
            <p className="text-xs text-[#606060] mb-4">
              Ao confirmar, o terreno passará para <strong>Contrato Assinado</strong> e as parcelas financeiras serão geradas automaticamente.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#606060] mb-1.5">Data de Assinatura</label>
              <input
                type="date"
                value={dataAssinatura}
                onChange={(e) => setDataAssinatura(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(null)}
                className="flex-1 h-9 rounded-lg border border-black/20 text-sm font-medium text-[#606060] hover:bg-[#F7F7F7]"
              >
                Cancelar
              </button>
              <button
                onClick={() => mudarStatus("ASSINADO")}
                disabled={mudandoStatus}
                className="flex-1 h-9 rounded-lg bg-black text-white text-sm font-medium hover:bg-[#222] disabled:opacity-50"
              >
                {mudandoStatus ? <Loader2 size={13} className="animate-spin mx-auto" /> : "Confirmar Assinatura"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
