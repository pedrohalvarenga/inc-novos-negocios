"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus, FileText, ChevronRight, AlertTriangle, Send, Check,
  X, RefreshCw, Loader2, ExternalLink, Printer, Clock,
} from "lucide-react";
import PropostaStatusBadge from "./PropostaStatusBadge";
import PropostaForm from "./PropostaForm";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { FORMA_PAGAMENTO_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { gerarHtmlProposta } from "@/lib/propostas/template";

interface Proposta {
  id: string;
  versao: number;
  status: string;
  valorProposto?: number | null;
  formaPagamento?: string | null;
  prazo?: number | null;
  percentualPermuta?: number | null;
  condicoesEspeciais?: string | null;
  validade?: string | null;
  dataEnvio?: string | null;
  motivoRecusa?: string | null;
  baseParaContrato?: boolean;
  createdAt: string;
  criador?: { nome: string };
}

interface Terreno {
  id: string;
  nome: string;
  valorCompra?: number | null;
  formaPagamento?: string | null;
  prazoPagamento?: number | null;
  percentualPermuta?: number | null;
  proprietarios?: { proprietario: { nomeRazaoSocial: string; cpfCnpj?: string | null } }[];
  responsavel?: { nome: string; email: string };
  logradouro: string;
  numero?: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  cep?: string | null;
  areaTerreno: number;
}

interface Props {
  terrenoId: string;
  terreno: Terreno;
  usuarioRole: string;
}

const DIAS_ALERTA_EXPIRACAO = 5;

export default function PropostasTab({ terrenoId, terreno, usuarioRole }: Props) {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);
  const [acaoId, setAcaoId] = useState<string | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [showMotivoModal, setShowMotivoModal] = useState<string | null>(null);
  const [gerandoContrato, setGerandoContrato] = useState<string | null>(null);

  const podeAprovar = ["ADMIN", "GESTOR"].includes(usuarioRole);

  const carregar = useCallback(async () => {
    setLoading(true);
    const data = await fetch(`/api/propostas?terrenoId=${terrenoId}`).then((r) => r.json());
    setPropostas(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [terrenoId]);

  useEffect(() => { carregar(); }, [carregar]);

  async function mudarStatus(id: string, status: string, motivoRecusa?: string) {
    setAcaoId(id);
    try {
      const res = await fetch(`/api/propostas/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, motivoRecusa }),
      });
      if (res.ok) await carregar();
    } finally {
      setAcaoId(null);
      setShowMotivoModal(null);
      setMotivoRecusa("");
    }
  }

  async function gerarContrato(propostaId: string) {
    setGerandoContrato(propostaId);
    try {
      const res = await fetch("/api/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terrenoId, propostaId }),
      });
      if (res.ok) {
        const c = await res.json();
        window.location.href = `/contratos/${c.id}`;
      }
    } finally {
      setGerandoContrato(null);
    }
  }

  function imprimirProposta(proposta: Proposta) {
    const html = gerarHtmlProposta({
      vendedor: (terreno.proprietarios ?? []).map((tp) => ({
        nomeRazaoSocial: tp.proprietario.nomeRazaoSocial,
        cpfCnpj: tp.proprietario.cpfCnpj,
      })),
      terreno: {
        nome: terreno.nome,
        logradouro: terreno.logradouro,
        numero: terreno.numero,
        bairro: terreno.bairro,
        cidade: terreno.cidade,
        uf: terreno.uf,
        cep: terreno.cep,
        areaTerreno: terreno.areaTerreno,
      },
      proposta: {
        versao: proposta.versao,
        valorProposto: proposta.valorProposto,
        formaPagamento: proposta.formaPagamento as any,
        prazo: proposta.prazo,
        percentualPermuta: proposta.percentualPermuta,
        condicoesEspeciais: proposta.condicoesEspeciais,
        validade: proposta.validade,
      },
      responsavel: terreno.responsavel ?? { nome: "Equipe INC", email: "novosnegocios@inc.com.br" },
      dataEmissao: new Date(),
    });

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  }

  function isExpirando(validade?: string | null): boolean {
    if (!validade) return false;
    const diff = new Date(validade).getTime() - Date.now();
    return diff > 0 && diff < DIAS_ALERTA_EXPIRACAO * 86400000;
  }

  function isExpirada(validade?: string | null): boolean {
    if (!validade) return false;
    return new Date(validade).getTime() < Date.now();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="animate-spin text-[#606060]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-black">Propostas</h3>
          <p className="text-xs text-[#606060] mt-0.5">
            {propostas.length === 0
              ? "Nenhuma proposta criada"
              : `${propostas.length} proposta${propostas.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/propostas"
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-black/20 text-xs font-medium text-[#606060] hover:bg-[#F7F7F7] transition-colors"
          >
            <ExternalLink size={12} />
            Ver todas
          </Link>
          <button
            onClick={() => setCriando(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-black text-white text-xs font-medium hover:bg-[#222] transition-colors"
          >
            <Plus size={13} />
            Nova Proposta
          </button>
        </div>
      </div>

      {/* Lista */}
      {propostas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText size={32} className="text-[#E5E5E5] mb-3" />
          <p className="text-sm font-medium text-black">Nenhuma proposta ainda</p>
          <p className="text-xs text-[#606060] mt-1 max-w-xs">
            Crie a primeira proposta de aquisição para este terreno
          </p>
          <button
            onClick={() => setCriando(true)}
            className="mt-4 flex items-center gap-1.5 h-8 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-[#222] transition-colors"
          >
            <Plus size={13} />
            Nova Proposta
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {propostas.map((p) => {
            const expirando = isExpirando(p.validade);
            const expirada = p.status !== "EXPIRADA" && isExpirada(p.validade);

            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-xl border p-4 transition-all",
                  expirando ? "border-[#F26522]/40 bg-[#FFF8F5]" : "border-black/8 bg-white"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-black">v{p.versao}</span>
                      <PropostaStatusBadge status={p.status as any} />
                      {p.baseParaContrato && (
                        <span className="text-xs font-medium text-[#065F46] bg-[#D1FAE5] px-2 py-0.5 rounded-full">
                          Base de contrato
                        </span>
                      )}
                      {expirando && (
                        <span className="flex items-center gap-1 text-xs font-medium text-[#c2410c] bg-[#FFF0E8] px-2 py-0.5 rounded-full">
                          <AlertTriangle size={10} />
                          Expira em breve
                        </span>
                      )}
                    </div>

                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-xs">
                      <span className="text-[#606060]">
                        Valor: <span className="text-black font-medium">{formatCurrency(p.valorProposto)}</span>
                      </span>
                      {p.formaPagamento && (
                        <span className="text-[#606060]">
                          Pgto: <span className="text-black font-medium">
                            {FORMA_PAGAMENTO_LABELS[p.formaPagamento as keyof typeof FORMA_PAGAMENTO_LABELS]}
                          </span>
                        </span>
                      )}
                      {p.validade && (
                        <span className={cn("text-[#606060]", expirando && "text-[#c2410c] font-medium")}>
                          Válida até: <span className="font-medium">{formatDate(p.validade)}</span>
                        </span>
                      )}
                      {p.dataEnvio && (
                        <span className="text-[#606060]">
                          Enviada: <span className="text-black font-medium">{formatDate(p.dataEnvio)}</span>
                        </span>
                      )}
                    </div>

                    {p.motivoRecusa && (
                      <p className="mt-2 text-xs text-[#991B1B] bg-[#FEE2E2] rounded px-2 py-1">
                        Motivo da recusa: {p.motivoRecusa}
                      </p>
                    )}

                    {p.condicoesEspeciais && (
                      <p className="mt-2 text-xs text-[#606060] line-clamp-2">{p.condicoesEspeciais}</p>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-start gap-2 shrink-0">
                    {/* PDF */}
                    <button
                      onClick={() => imprimirProposta(p)}
                      title="Imprimir / Exportar PDF"
                      className="p-1.5 rounded-lg hover:bg-[#F7F7F7] text-[#606060] hover:text-black transition-colors"
                    >
                      <Printer size={14} />
                    </button>

                    {/* Ações por status */}
                    {p.status === "RASCUNHO" && podeAprovar && (
                      <button
                        onClick={() => mudarStatus(p.id, "ENVIADA")}
                        disabled={acaoId === p.id}
                        title="Aprovar e Enviar"
                        className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#DBEAFE] text-[#1E40AF] text-xs font-medium hover:bg-[#BFDBFE] transition-colors"
                      >
                        {acaoId === p.id ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                        Enviar
                      </button>
                    )}

                    {["ENVIADA", "EM_NEGOCIACAO"].includes(p.status) && podeAprovar && (
                      <>
                        <button
                          onClick={() => mudarStatus(p.id, "ACEITA")}
                          disabled={acaoId === p.id}
                          title="Marcar como Aceita"
                          className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#D1FAE5] text-[#065F46] text-xs font-medium hover:bg-[#A7F3D0] transition-colors"
                        >
                          {acaoId === p.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                          Aceitar
                        </button>
                        <button
                          onClick={() => setShowMotivoModal(p.id)}
                          title="Marcar como Recusada"
                          className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#FEE2E2] text-[#991B1B] text-xs font-medium hover:bg-[#FECACA] transition-colors"
                        >
                          <X size={11} />
                          Recusar
                        </button>
                      </>
                    )}

                    {["ENVIADA", "EM_NEGOCIACAO"].includes(p.status) && !podeAprovar && (
                      <button
                        onClick={() => mudarStatus(p.id, "EM_NEGOCIACAO")}
                        disabled={p.status === "EM_NEGOCIACAO" || acaoId === p.id}
                        title="Marcar em Negociação"
                        className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#FEF3C7] text-[#92400E] text-xs font-medium hover:bg-[#FDE68A] transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={11} />
                        Negociando
                      </button>
                    )}

                    {p.status === "ACEITA" && !p.baseParaContrato && (
                      <button
                        onClick={() => gerarContrato(p.id)}
                        disabled={gerandoContrato === p.id}
                        className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#F26522] text-white text-xs font-medium hover:bg-[#d9551a] transition-colors"
                      >
                        {gerandoContrato === p.id ? <Loader2 size={11} className="animate-spin" /> : <FileText size={11} />}
                        Gerar Contrato
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-black/6 flex items-center justify-between">
                  <span className="text-[10px] text-[#A0A0A0]">
                    Criado em {formatDate(p.createdAt)}{p.criador?.nome ? ` por ${p.criador.nome}` : ""}
                  </span>
                  <Link
                    href={`/propostas/${p.id}`}
                    className="flex items-center gap-0.5 text-[10px] text-[#606060] hover:text-black transition-colors"
                  >
                    Ver detalhes <ChevronRight size={10} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: motivo de recusa */}
      {showMotivoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <h3 className="text-sm font-semibold text-black mb-3">Motivo da Recusa</h3>
            <textarea
              value={motivoRecusa}
              onChange={(e) => setMotivoRecusa(e.target.value)}
              placeholder="Descreva o motivo pelo qual a proposta foi recusada..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-black transition-colors resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowMotivoModal(null); setMotivoRecusa(""); }}
                className="flex-1 h-9 rounded-lg border border-black/20 text-sm font-medium text-[#606060] hover:bg-[#F7F7F7] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => mudarStatus(showMotivoModal, "RECUSADA", motivoRecusa)}
                className="flex-1 h-9 rounded-lg bg-[#FEE2E2] text-[#991B1B] text-sm font-medium hover:bg-[#FECACA] transition-colors"
              >
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: criar proposta */}
      {criando && (
        <PropostaForm
          terrenoId={terrenoId}
          terrenoNome={terreno.nome}
          valorSugerido={terreno.valorCompra}
          formaPagamentoSugerida={terreno.formaPagamento}
          prazoSugerido={terreno.prazoPagamento}
          percentualPermutaSugerido={terreno.percentualPermuta}
          onSalvo={() => { setCriando(false); carregar(); }}
          onFechar={() => setCriando(false)}
        />
      )}
    </div>
  );
}
