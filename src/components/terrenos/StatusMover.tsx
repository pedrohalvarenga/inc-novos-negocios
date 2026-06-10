"use client";

import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { STATUS_TERRENO_LABELS, STATUS_TERRENO_ORDER } from "@/lib/constants";
import type { StatusTerreno } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  terreno: { id: string; status: StatusTerreno };
  onUpdate: () => void;
}

const PROXIMOS_STATUS: Partial<Record<StatusTerreno, StatusTerreno[]>> = {
  PROSPECCAO: ["EM_NEGOCIACAO", "DESCARTADO"],
  EM_NEGOCIACAO: ["PROPOSTA_ENVIADA", "DESCARTADO"],
  PROPOSTA_ENVIADA: ["PROPOSTA_ACEITA", "EM_NEGOCIACAO", "DESCARTADO"],
  PROPOSTA_ACEITA: ["CONTRATO_EM_ELABORACAO", "EM_NEGOCIACAO"],
  CONTRATO_EM_ELABORACAO: ["CONTRATO_ASSINADO"],
};

export default function StatusMover({ terreno, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [obs, setObs] = useState("");
  const [pendente, setPendente] = useState<StatusTerreno | null>(null);

  const proximos = PROXIMOS_STATUS[terreno.status] ?? [];
  if (!proximos.length) return null;

  async function mover(novoStatus: StatusTerreno) {
    setLoading(true);
    await fetch(`/api/terrenos/${terreno.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus, observacao: obs }),
    });
    setLoading(false);
    setOpen(false);
    setObs("");
    setPendente(null);
    onUpdate();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#F26522] text-white text-sm font-medium hover:bg-[#D4581C] disabled:opacity-50 transition-colors"
      >
        <ArrowRight size={14} />
        Mover Status
        <ChevronDown size={13} className={cn("transition-transform", open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-72 bg-white rounded-xl border border-black/12 shadow-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-[#606060] uppercase tracking-wide">
            Mover para
          </p>
          <div className="space-y-1">
            {proximos.map((s) => (
              <button
                key={s}
                onClick={() => setPendente(s)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pendente === s
                    ? "bg-black text-white"
                    : "hover:bg-[#F7F7F7] text-black"
                )}
              >
                {STATUS_TERRENO_LABELS[s]}
              </button>
            ))}
          </div>

          {pendente && (
            <>
              <textarea
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Observação (opcional)"
                rows={2}
                className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm text-black bg-white outline-none focus:border-black transition resize-none placeholder:text-[#A0A0A0]"
              />
              <button
                onClick={() => mover(pendente)}
                disabled={loading}
                className="w-full h-9 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "Movendo…" : `Confirmar → ${STATUS_TERRENO_LABELS[pendente]}`}
              </button>
            </>
          )}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
