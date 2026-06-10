"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { FORMA_PAGAMENTO_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";
import { parseCurrencyInput } from "@/lib/formatters";

const Schema = z.object({
  valorProposto: z.string().optional(),
  formaPagamento: z.enum(["PERMUTA_FISICA", "PERMUTA_FINANCEIRA", "DINHEIRO_PRAZO", "DINHEIRO_VISTA", "MISTO", ""]).optional(),
  prazo: z.string().optional(),
  percentualPermuta: z.string().optional(),
  condicoesEspeciais: z.string().optional(),
  validade: z.string().optional(),
});

type FormValues = z.infer<typeof Schema>;

interface Props {
  terrenoId: string;
  terrenoNome: string;
  valorSugerido?: number | null;
  formaPagamentoSugerida?: string | null;
  prazoSugerido?: number | null;
  percentualPermutaSugerido?: number | null;
  onSalvo: () => void;
  onFechar: () => void;
}

export default function PropostaForm({
  terrenoId,
  terrenoNome,
  valorSugerido,
  formaPagamentoSugerida,
  prazoSugerido,
  percentualPermutaSugerido,
  onSalvo,
  onFechar,
}: Props) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const { register, handleSubmit, watch } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      valorProposto: valorSugerido ? valorSugerido.toString() : "",
      formaPagamento: (formaPagamentoSugerida ?? "") as any,
      prazo: prazoSugerido?.toString() ?? "",
      percentualPermuta: percentualPermutaSugerido?.toString() ?? "",
    },
  });

  const formaPgto = watch("formaPagamento");
  const temPermuta = formaPgto === "PERMUTA_FISICA" || formaPgto === "PERMUTA_FINANCEIRA" || formaPgto === "MISTO";
  const temPrazo = formaPgto === "DINHEIRO_PRAZO" || formaPgto === "PERMUTA_FINANCEIRA" || formaPgto === "MISTO";

  async function onSubmit(values: FormValues) {
    setSalvando(true);
    setErro("");
    try {
      const body: Record<string, any> = { terrenoId };
      if (values.valorProposto) body.valorProposto = parseCurrencyInput(values.valorProposto);
      if (values.formaPagamento) body.formaPagamento = values.formaPagamento;
      if (values.prazo) body.prazo = parseInt(values.prazo);
      if (values.percentualPermuta) body.percentualPermuta = parseFloat(values.percentualPermuta);
      if (values.condicoesEspeciais) body.condicoesEspeciais = values.condicoesEspeciais;
      if (values.validade) body.validade = values.validade;

      const res = await fetch("/api/propostas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setErro(data.error?.message ?? "Erro ao salvar proposta");
        return;
      }

      onSalvo();
    } catch {
      setErro("Erro de conexão");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <div>
            <h2 className="text-base font-semibold text-black">Nova Proposta</h2>
            <p className="text-xs text-[#606060] mt-0.5">{terrenoNome}</p>
          </div>
          <button
            onClick={onFechar}
            className="p-1.5 rounded-lg hover:bg-[#F7F7F7] transition-colors"
          >
            <X size={16} className="text-[#606060]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Valor */}
          <div>
            <label className="block text-xs font-medium text-[#606060] mb-1.5">Valor Proposto (R$)</label>
            <input
              {...register("valorProposto")}
              type="text"
              placeholder={valorSugerido ? formatCurrency(valorSugerido) : "Ex: 5.000.000"}
              className="w-full h-9 px-3 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Forma de pagamento */}
          <div>
            <label className="block text-xs font-medium text-[#606060] mb-1.5">Forma de Pagamento</label>
            <select
              {...register("formaPagamento")}
              className="w-full h-9 px-3 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-black transition-colors bg-white"
            >
              <option value="">Selecione...</option>
              {Object.entries(FORMA_PAGAMENTO_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prazo */}
            {temPrazo && (
              <div>
                <label className="block text-xs font-medium text-[#606060] mb-1.5">Prazo (meses)</label>
                <input
                  {...register("prazo")}
                  type="number"
                  min="1"
                  max="360"
                  placeholder="Ex: 24"
                  className="w-full h-9 px-3 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
            )}

            {/* % Permuta */}
            {temPermuta && (
              <div>
                <label className="block text-xs font-medium text-[#606060] mb-1.5">% Permuta</label>
                <input
                  {...register("percentualPermuta")}
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Ex: 100"
                  className="w-full h-9 px-3 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
            )}
          </div>

          {/* Validade */}
          <div>
            <label className="block text-xs font-medium text-[#606060] mb-1.5">Validade da Proposta</label>
            <input
              {...register("validade")}
              type="date"
              className="w-full h-9 px-3 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Condições especiais */}
          <div>
            <label className="block text-xs font-medium text-[#606060] mb-1.5">
              Condições Especiais e Observações
            </label>
            <textarea
              {...register("condicoesEspeciais")}
              rows={4}
              placeholder="Descreva as condições comerciais, detalhes da permuta, cronograma de pagamento, etc."
              className="w-full px-3 py-2 rounded-lg border border-black/20 text-sm focus:outline-none focus:border-black transition-colors resize-none"
            />
          </div>

          {erro && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 h-9 rounded-lg border border-black/20 text-sm font-medium text-[#606060] hover:bg-[#F7F7F7] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 h-9 rounded-lg bg-black text-white text-sm font-medium hover:bg-[#222] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {salvando && <Loader2 size={14} className="animate-spin" />}
              Salvar Rascunho
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
