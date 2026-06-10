"use client";

import { AlertTriangle, Shield, ShieldAlert, ShieldOff, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type RiscoOnus = "IMPEDITIVO" | "ALTO" | "MEDIO" | "BAIXO";

interface Onus {
  tipo: string;
  descricao: string;
  risco: RiscoOnus;
  livroFolha?: string;
}

interface Props {
  onus: Onus[];
  riscoConsolidado?: RiscoOnus | null;
}

const RISCO_CONFIG: Record<RiscoOnus, {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = {
  IMPEDITIVO: {
    label: "IMPEDITIVO",
    bg: "bg-red-950",
    text: "text-white",
    border: "border-red-900",
    icon: ShieldOff,
  },
  ALTO: {
    label: "ALTO",
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    icon: ShieldAlert,
  },
  MEDIO: {
    label: "MÉDIO",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
    icon: AlertTriangle,
  },
  BAIXO: {
    label: "BAIXO",
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
    icon: Shield,
  },
};

export function RiscoBadge({ risco, size = "sm" }: { risco: RiscoOnus; size?: "sm" | "md" | "lg" }) {
  const cfg = RISCO_CONFIG[risco];
  const Icon = cfg.icon;
  const sizeClasses = size === "lg" ? "px-4 py-2 text-sm" : size === "md" ? "px-3 py-1.5 text-xs" : "px-2 py-0.5 text-[11px]";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full font-bold border", cfg.bg, cfg.text, cfg.border, sizeClasses)}>
      <Icon size={size === "lg" ? 16 : 12} />
      {cfg.label}
    </span>
  );
}

export default function MatriculaRiscos({ onus, riscoConsolidado }: Props) {
  if (!onus || onus.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <Shield size={32} className="text-green-600 mx-auto mb-2" />
        <p className="font-semibold text-green-800">Nenhum ônus ou gravame identificado</p>
        <p className="text-sm text-green-700 mt-1">A matrícula não apresenta restrições registradas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {riscoConsolidado && (
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-xl border",
          riscoConsolidado === "IMPEDITIVO" ? "bg-red-950 border-red-900" :
          riscoConsolidado === "ALTO" ? "bg-red-50 border-red-200" :
          riscoConsolidado === "MEDIO" ? "bg-yellow-50 border-yellow-200" :
          "bg-green-50 border-green-200"
        )}>
          <div>
            <p className={cn("text-xs font-medium uppercase tracking-wide", riscoConsolidado === "IMPEDITIVO" ? "text-red-300" : "text-[#606060]")}>
              Risco Consolidado
            </p>
            <RiscoBadge risco={riscoConsolidado} size="lg" />
          </div>
          {riscoConsolidado === "IMPEDITIVO" && (
            <p className="text-red-300 text-sm ml-2">
              Esta matrícula possui ônus impeditivo. A assinatura do contrato será bloqueada.
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {onus.map((o, idx) => {
          const cfg = RISCO_CONFIG[o.risco];
          const Icon = cfg.icon;
          return (
            <div key={idx} className={cn("rounded-xl border p-4", cfg.border, "bg-white")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <RiscoBadge risco={o.risco} />
                    <span className="text-sm font-semibold text-black">{o.tipo}</span>
                  </div>
                  <p className="text-sm text-[#606060]">{o.descricao}</p>
                  {o.livroFolha && (
                    <p className="text-xs text-[#A0A0A0] mt-1">Livro/Folha: {o.livroFolha}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 p-3 bg-[#F7F7F7] rounded-lg">
        <Info size={14} className="text-[#606060] shrink-0 mt-0.5" />
        <p className="text-xs text-[#606060]">
          Análise gerada por IA como apoio à decisão. Confirme sempre com a certidão de inteiro teor atualizada.
        </p>
      </div>
    </div>
  );
}
