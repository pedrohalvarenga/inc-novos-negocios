"use client";

import { AlertTriangle, CheckCircle, AlertCircle, Info, Loader2, Scale } from "lucide-react";
import type { AnaliseClausula } from "@/lib/contratos/template";
import { formatDateTime } from "@/lib/formatters";

const RISCO_CONFIG = {
  BAIXO:  { icon: CheckCircle,  bg: "#D1FAE5", border: "#A7F3D0", text: "#065F46", label: "Risco Baixo" },
  MEDIO:  { icon: AlertCircle,  bg: "#FEF3C7", border: "#FDE68A", text: "#92400E", label: "Risco Médio" },
  ALTO:   { icon: AlertTriangle, bg: "#FEE2E2", border: "#FECACA", text: "#991B1B", label: "Risco Alto"  },
};

interface Props {
  analise: AnaliseClausula | null | undefined;
  analisando: boolean;
  clausulaTitulo?: string;
  onAnalisar: () => void;
}

export default function AnaliseJuridicaPanel({ analise, analisando, clausulaTitulo, onAnalisar }: Props) {
  if (analisando) {
    return (
      <div className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Scale size={14} className="text-[#1E40AF]" />
          <span className="text-xs font-semibold text-[#1E40AF]">Analisando com IA...</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#1E40AF]">
          <Loader2 size={12} className="animate-spin" />
          Consultando advogado IA da INC
        </div>
      </div>
    );
  }

  if (!analise) {
    return (
      <div className="rounded-xl border border-black/8 bg-[#F7F7F7] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Scale size={14} className="text-[#606060]" />
          <span className="text-xs font-semibold text-[#606060]">Análise Jurídica por IA</span>
        </div>
        <p className="text-xs text-[#606060] mb-3">
          {clausulaTitulo
            ? `Clique para analisar a cláusula "${clausulaTitulo}" com IA.`
            : "Salve alterações e clique para analisar com IA."}
        </p>
        <button
          onClick={onAnalisar}
          className="w-full h-8 rounded-lg bg-black text-white text-xs font-medium hover:bg-[#222] transition-colors flex items-center justify-center gap-1.5"
        >
          <Scale size={12} />
          Analisar com IA
        </button>
        <p className="text-[10px] text-[#A0A0A0] text-center mt-2">
          Análise automática ao salvar alterações
        </p>
      </div>
    );
  }

  const cfg = RISCO_CONFIG[analise.risco] ?? RISCO_CONFIG.MEDIO;
  const Icon = cfg.icon;

  return (
    <div className="space-y-3">
      {/* Risco */}
      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon size={14} style={{ color: cfg.text }} />
          <span className="text-xs font-semibold" style={{ color: cfg.text }}>{cfg.label}</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: cfg.text }}>
          {analise.explicacao}
        </p>
      </div>

      {/* Sugestão de redação */}
      {analise.sugestao && (
        <div className="rounded-xl border border-[#FFF0E8] bg-[#FFF8F5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info size={13} className="text-[#F26522]" />
            <span className="text-xs font-semibold text-[#c2410c]">Redação sugerida</span>
          </div>
          <p className="text-xs text-[#606060] leading-relaxed whitespace-pre-wrap">{analise.sugestao}</p>
        </div>
      )}

      {/* Dicas de negociação */}
      {analise.dicasNegociacao && (
        <div className="rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={13} className="text-[#065F46]" />
            <span className="text-xs font-semibold text-[#065F46]">Dica de negociação</span>
          </div>
          <p className="text-xs text-[#606060] leading-relaxed">{analise.dicasNegociacao}</p>
        </div>
      )}

      <p className="text-[10px] text-[#A0A0A0]">
        Analisado em {analise.analisadoEm ? formatDateTime(analise.analisadoEm) : "—"}
      </p>

      <button
        onClick={onAnalisar}
        className="w-full h-7 rounded-lg border border-black/20 text-xs font-medium text-[#606060] hover:bg-[#F7F7F7] transition-colors"
      >
        Reanalisar
      </button>

      {/* Disclaimer */}
      <div className="rounded-lg bg-[#FFF0E8] border border-[#F26522]/30 p-3">
        <p className="text-[10px] text-[#c2410c] leading-relaxed font-medium">
          ⚠️ Análise gerada por IA como apoio. Não substitui a revisão do departamento jurídico.
        </p>
      </div>
    </div>
  );
}
