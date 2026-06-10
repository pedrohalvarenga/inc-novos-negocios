"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { parseCurrencyInput } from "@/lib/formatters";

const TIPOS = [
  { value: "PARCELA_TERRENISTA", label: "Parcela Terrenista" },
  { value: "IPTU", label: "IPTU" },
  { value: "MANUTENCAO", label: "Manutenção" },
  { value: "CERCA", label: "Cerca" },
  { value: "COMISSAO", label: "Comissão" },
  { value: "CARTORIO", label: "Cartório" },
  { value: "OUTROS", label: "Outros" },
];

const FREQ = [
  { value: "MENSAL", label: "Mensal" },
  { value: "ANUAL", label: "Anual" },
  { value: "QUINZENAL", label: "Quinzenal" },
  { value: "SEMANAL", label: "Semanal" },
];

interface Props {
  terrenoId: string;
  onSalvo: () => void;
  onFechar: () => void;
}

export default function LancamentoForm({ terrenoId, onSalvo, onFechar }: Props) {
  const [form, setForm] = useState({
    tipo: "IPTU",
    descricao: "",
    valor: "",
    vencimento: "",
    status: "PREVISTO",
    recorrente: false,
    frequencia: "MENSAL",
    totalParcelas: 1,
  });
  const [salvando, setSalvando] = useState(false);

  function set(k: string, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const body: any = {
      terrenoId,
      tipo: form.tipo,
      descricao: form.descricao || undefined,
      valor: parseCurrencyInput(form.valor),
      vencimento: form.vencimento ? new Date(form.vencimento).toISOString() : undefined,
      status: form.status,
      recorrente: form.recorrente,
      recorrencia: form.recorrente ? form.frequencia : undefined,
    };
    if (form.recorrente && form.totalParcelas > 1) {
      body.recorrenciaConfig = {
        frequencia: form.frequencia,
        totalParcelas: form.totalParcelas,
        parcelaAtual: 1,
      };
    }
    await fetch("/api/financeiro/lancamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSalvando(false);
    onSalvo();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <h2 className="text-base font-semibold text-black">Novo Lançamento</h2>
          <button onClick={onFechar}><X size={18} /></button>
        </div>
        <form onSubmit={salvar} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-[#606060] block mb-1">Tipo</label>
              <select value={form.tipo} onChange={(e) => set("tipo", e.target.value)}
                className="w-full h-9 rounded-lg border border-black/15 px-3 text-sm bg-white">
                {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-[#606060] block mb-1">Descrição (opcional)</label>
              <input value={form.descricao} onChange={(e) => set("descricao", e.target.value)}
                className="w-full h-9 rounded-lg border border-black/15 px-3 text-sm" placeholder="Ex: Parcela 1/12" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#606060] block mb-1">Valor (R$)</label>
              <input required value={form.valor} onChange={(e) => set("valor", e.target.value)}
                className="w-full h-9 rounded-lg border border-black/15 px-3 text-sm" placeholder="1.500,00" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#606060] block mb-1">Vencimento</label>
              <input type="date" value={form.vencimento} onChange={(e) => set("vencimento", e.target.value)}
                className="w-full h-9 rounded-lg border border-black/15 px-3 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-[#606060] block mb-1">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full h-9 rounded-lg border border-black/15 px-3 text-sm bg-white">
                <option value="PREVISTO">Previsto</option>
                <option value="A_PAGAR">A pagar</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.recorrente} onChange={(e) => set("recorrente", e.target.checked)}
              className="rounded" />
            Recorrente
          </label>

          {form.recorrente && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#F7F7F7] rounded-lg">
              <div>
                <label className="text-xs font-medium text-[#606060] block mb-1">Frequência</label>
                <select value={form.frequencia} onChange={(e) => set("frequencia", e.target.value)}
                  className="w-full h-9 rounded-lg border border-black/15 px-3 text-sm bg-white">
                  {FREQ.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#606060] block mb-1">Nº de parcelas</label>
                <input type="number" min={1} max={60} value={form.totalParcelas}
                  onChange={(e) => set("totalParcelas", parseInt(e.target.value))}
                  className="w-full h-9 rounded-lg border border-black/15 px-3 text-sm" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onFechar}
              className="h-9 px-4 rounded-lg border border-black/15 text-sm font-medium text-black hover:bg-[#F7F7F7]">
              Cancelar
            </button>
            <button type="submit" disabled={salvando}
              className="h-9 px-4 rounded-lg bg-[#FF7924] text-white text-sm font-medium hover:bg-[#e06a1e] disabled:opacity-50">
              {salvando ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
