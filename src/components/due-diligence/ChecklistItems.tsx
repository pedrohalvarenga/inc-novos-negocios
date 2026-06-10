"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, Clock, Edit2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusChecklist = "PENDENTE" | "OK" | "ALERTA" | "CRITICO";

export interface ItemChecklist {
  item: string;
  status: StatusChecklist;
  data?: string;
  evidencia?: string;
  fonte?: string;
}

interface Props {
  checklist: ItemChecklist[];
  readonly?: boolean;
  onChange?: (checklist: ItemChecklist[]) => void;
}

const STATUS_CONFIG: Record<StatusChecklist, {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  bg: string;
  text: string;
  border: string;
}> = {
  PENDENTE: { label: "Pendente", icon: Clock, bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
  OK: { label: "OK", icon: CheckCircle, bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  ALERTA: { label: "Alerta", icon: AlertTriangle, bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  CRITICO: { label: "Crítico", icon: XCircle, bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
};

const STATUS_OPTIONS: StatusChecklist[] = ["PENDENTE", "OK", "ALERTA", "CRITICO"];

export function StatusBadge({ status }: { status: StatusChecklist }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border", cfg.bg, cfg.text, cfg.border)}>
      <Icon size={11} />{cfg.label}
    </span>
  );
}

export default function ChecklistItems({ checklist, readonly = false, onChange }: Props) {
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState<Partial<ItemChecklist>>({});

  function iniciarEdicao(idx: number) {
    setEditandoIdx(idx);
    setEditVal({ ...checklist[idx] });
  }

  function salvarEdicao() {
    if (editandoIdx === null) return;
    const novo = checklist.map((item, i) => i === editandoIdx ? { ...item, ...editVal, data: new Date().toISOString().split("T")[0] } : item);
    onChange?.(novo);
    setEditandoIdx(null);
  }

  const totais = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = checklist.filter((c) => c.status === s).length;
    return acc;
  }, {} as Record<StatusChecklist, number>);

  return (
    <div className="space-y-3">
      {/* Resumo */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((s) => totais[s] > 0 && (
          <div key={s} className={cn("px-2 py-1 rounded-lg text-xs font-semibold border", STATUS_CONFIG[s].bg, STATUS_CONFIG[s].text, STATUS_CONFIG[s].border)}>
            {STATUS_CONFIG[s].label}: {totais[s]}
          </div>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {checklist.map((item, idx) => {
          const cfg = STATUS_CONFIG[item.status];
          const editando = editandoIdx === idx;
          return (
            <div key={idx} className={cn("rounded-xl border p-4 transition-colors", cfg.border, editando ? "bg-orange-50" : "bg-white")}>
              {editando ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-black">{item.item}</p>
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map((s) => {
                      const sCfg = STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          onClick={() => setEditVal((v) => ({ ...v, status: s }))}
                          className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all", sCfg.bg, sCfg.text, sCfg.border, editVal.status === s ? "ring-2 ring-[#FF7924]" : "")}
                        >
                          {sCfg.label}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    value={editVal.evidencia ?? ""}
                    onChange={(e) => setEditVal((v) => ({ ...v, evidencia: e.target.value }))}
                    placeholder="Evidência ou observação (opcional)"
                    className="w-full text-sm border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-[#FF7924]"
                  />
                  <input
                    value={editVal.fonte ?? ""}
                    onChange={(e) => setEditVal((v) => ({ ...v, fonte: e.target.value }))}
                    placeholder="Fonte consultada (opcional)"
                    className="w-full text-sm border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-[#FF7924]"
                  />
                  <div className="flex gap-2">
                    <button onClick={salvarEdicao} className="flex items-center gap-1 h-8 px-3 rounded-lg bg-[#FF7924] text-white text-xs font-semibold">
                      <Save size={12} /> Salvar
                    </button>
                    <button onClick={() => setEditandoIdx(null)} className="flex items-center gap-1 h-8 px-3 rounded-lg border border-black/20 text-xs font-medium text-black">
                      <X size={12} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <StatusBadge status={item.status} />
                      <span className="text-sm font-medium text-black">{item.item}</span>
                    </div>
                    {item.evidencia && <p className="text-xs text-[#606060]">{item.evidencia}</p>}
                    {item.fonte && <p className="text-[11px] text-[#A0A0A0]">Fonte: {item.fonte}</p>}
                    {item.data && <p className="text-[11px] text-[#A0A0A0]">Atualizado em {item.data}</p>}
                  </div>
                  {!readonly && (
                    <button onClick={() => iniciarEdicao(idx)} className="text-[#606060] hover:text-[#FF7924] transition-colors">
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
