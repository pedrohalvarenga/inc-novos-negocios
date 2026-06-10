"use client";

import { TrendingDown, TrendingUp, Minus, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  score: number | null;
  resumo?: string | null;
  parecer?: {
    alertaFraude?: boolean;
    motivoAlertaFraude?: string;
    recomendacoes?: string[];
    podeProsseguir?: "SIM" | "COM_RESSALVAS" | "NAO";
    justificativaProsseguir?: string;
  };
}

function ScoreCircle({ score }: { score: number }) {
  const cor = score >= 70 ? "#16a34a" : score >= 40 ? "#d97706" : "#dc2626";
  const label = score >= 70 ? "Baixo Risco" : score >= 40 ? "Risco Moderado" : "Alto Risco";
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-24 h-24 rounded-full border-4 flex items-center justify-center"
        style={{ borderColor: cor }}
      >
        <span className="text-3xl font-bold" style={{ color: cor }}>{score}</span>
      </div>
      <span className="text-xs font-medium" style={{ color: cor }}>{label}</span>
      <span className="text-[11px] text-[#606060]">Score de risco (0–100)</span>
    </div>
  );
}

const PROSSEGUIR_CONFIG = {
  SIM: { label: "Pode prosseguir", icon: CheckCircle, class: "bg-green-50 border-green-200 text-green-800" },
  COM_RESSALVAS: { label: "Pode prosseguir com ressalvas", icon: AlertTriangle, class: "bg-yellow-50 border-yellow-200 text-yellow-800" },
  NAO: { label: "Não recomendado prosseguir", icon: XCircle, class: "bg-red-50 border-red-200 text-red-800" },
};

export default function ScorePanel({ score, resumo, parecer }: Props) {
  if (score === null && !resumo && !parecer) {
    return (
      <div className="rounded-xl border border-black/8 bg-[#F7F7F7] p-6 text-center">
        <Minus size={24} className="text-[#606060] mx-auto mb-2" />
        <p className="text-sm text-[#606060]">Parecer de IA ainda não gerado</p>
      </div>
    );
  }

  const prosseguir = parecer?.podeProsseguir;
  const prosseguirCfg = prosseguir ? PROSSEGUIR_CONFIG[prosseguir] : null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-black/8 bg-white p-6">
        <div className="flex items-start gap-6">
          {score !== null && <ScoreCircle score={Math.round(score)} />}
          <div className="flex-1">
            {prosseguirCfg && (() => {
              const Icon = prosseguirCfg.icon;
              return (
                <div className={cn("flex items-center gap-2 p-3 rounded-lg border mb-3", prosseguirCfg.class)}>
                  <Icon size={16} />
                  <span className="text-sm font-semibold">{prosseguirCfg.label}</span>
                </div>
              );
            })()}
            {parecer?.justificativaProsseguir && (
              <p className="text-sm text-[#606060] mb-2">{parecer.justificativaProsseguir}</p>
            )}
            {resumo && (
              <p className="text-sm text-black">{resumo}</p>
            )}
          </div>
        </div>
      </div>

      {/* Alerta de fraude */}
      {parecer?.alertaFraude && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-red-700" />
            <span className="text-sm font-bold text-red-700">⚠️ Alerta: Risco de Fraude contra Credores</span>
          </div>
          {parecer.motivoAlertaFraude && (
            <p className="text-sm text-red-700">{parecer.motivoAlertaFraude}</p>
          )}
        </div>
      )}

      {/* Recomendações */}
      {parecer?.recomendacoes && parecer.recomendacoes.length > 0 && (
        <div className="rounded-xl border border-black/8 bg-white p-5">
          <h4 className="text-sm font-semibold text-black mb-3">Recomendações de Proteção à INC</h4>
          <ul className="space-y-2">
            {parecer.recomendacoes.map((r, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle size={14} className="text-[#FF7924] shrink-0 mt-0.5" />
                <span className="text-sm text-[#606060]">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
