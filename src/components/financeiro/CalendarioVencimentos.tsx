"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COR: Record<string, string> = {
  PAGO: "bg-green-500",
  PREVISTO: "bg-gray-400",
  A_PAGAR: "bg-yellow-500",
  ATRASADO: "bg-red-500",
};

interface Props {
  lancamentos: any[];
}

export default function CalendarioVencimentos({ lancamentos }: Props) {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());

  function navegar(delta: number) {
    let m = mes + delta;
    let a = ano;
    if (m < 0) { m = 11; a--; }
    if (m > 11) { m = 0; a++; }
    setMes(m); setAno(a);
  }

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const porDia: Record<number, any[]> = {};
  for (const l of lancamentos) {
    if (!l.vencimento) continue;
    const d = new Date(l.vencimento);
    if (d.getFullYear() === ano && d.getMonth() === mes) {
      const dia = d.getDate();
      if (!porDia[dia]) porDia[dia] = [];
      porDia[dia].push(l);
    }
  }

  const nomeMes = new Date(ano, mes).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const semanas = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const celulas = Array(primeiroDia).fill(null).concat(
    Array.from({ length: diasNoMes }, (_, i) => i + 1)
  );
  while (celulas.length % 7 !== 0) celulas.push(null);

  return (
    <div className="rounded-xl border border-black/8 bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-black capitalize">{nomeMes}</h2>
        <div className="flex gap-2">
          <button onClick={() => navegar(-1)} className="p-1.5 rounded-lg hover:bg-[#F7F7F7]">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => navegar(1)} className="p-1.5 rounded-lg hover:bg-[#F7F7F7]">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {semanas.map((s) => (
          <div key={s} className="text-center text-xs font-medium text-[#606060] py-1">{s}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celulas.map((dia, i) => {
          const isHoje = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
          const eventos = dia ? (porDia[dia] ?? []) : [];
          const temAtrasado = eventos.some((e) => e.status === "ATRASADO");

          return (
            <div
              key={i}
              className={cn(
                "min-h-[60px] rounded-lg p-1.5 text-xs",
                dia ? "bg-[#FAFAFA] hover:bg-[#F7F7F7]" : "",
                isHoje ? "ring-2 ring-[#FF7924]" : ""
              )}
            >
              {dia && (
                <>
                  <span className={cn(
                    "block text-center font-medium mb-1",
                    isHoje ? "text-[#FF7924]" : temAtrasado ? "text-red-600" : "text-black"
                  )}>{dia}</span>
                  <div className="space-y-0.5">
                    {eventos.slice(0, 3).map((l) => (
                      <div key={l.id} className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_COR[l.status] ?? "bg-gray-300"}`} />
                        <span className="truncate text-[#606060]">{l.terreno?.nome ?? l.tipo}</span>
                      </div>
                    ))}
                    {eventos.length > 3 && (
                      <div className="text-[10px] text-[#606060] px-1">+{eventos.length - 3} mais</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-4 pt-4 border-t border-black/6">
        {Object.entries({ PAGO: "Pago", PREVISTO: "Previsto", A_PAGAR: "A pagar", ATRASADO: "Atrasado" }).map(([s, l]) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-[#606060]">
            <span className={`w-2 h-2 rounded-full ${STATUS_COR[s]}`} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
