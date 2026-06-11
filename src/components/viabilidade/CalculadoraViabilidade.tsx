"use client";

import { useState, useEffect, useCallback } from "react";
import { calcularScore, DEFAULT_SCORE_CONFIG, faixaVgvColor } from "@/lib/score";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/formatters";
import { FORMA_PAGAMENTO_LABELS } from "@/lib/constants";
import ScoreBadge from "@/components/common/ScoreBadge";
import type { FormaPagamento } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  terreno: any;
  onSave?: () => void;
}

function InputField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-black">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#A0A0A0]">{hint}</p>}
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-black/20 px-3 text-sm text-black bg-white outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition";

export default function CalculadoraViabilidade({ terreno, onSave }: Props) {
  const [vgv, setVgv] = useState<number>(terreno.vgvEstimado ?? 0);
  const [valorCompra, setValorCompra] = useState<number>(terreno.valorCompra ?? 0);
  const [forma, setForma] = useState<FormaPagamento | "">(terreno.formaPagamento ?? "");
  const [prazo, setPrazo] = useState<number>(terreno.prazoPagamento ?? 0);
  const [percPermuta, setPercPermuta] = useState<number>(terreno.percentualPermuta ?? 0);
  const [ticketMedio, setTicketMedio] = useState<number>(
    terreno.vgvEstimado && terreno.numUnidadesEstimado
      ? Math.round(terreno.vgvEstimado / terreno.numUnidadesEstimado)
      : 0
  );
  const [saving, setSaving] = useState(false);

  const scoreResult = calcularScore({
    valorCompra: valorCompra || null,
    vgvEstimado: vgv || null,
    formaPagamento: (forma as FormaPagamento) || null,
    prazoPagamento: prazo || null,
    riscoMatricula: terreno.matriculas?.[0]?.riscoOnus ?? null,
  });

  const pct = vgv > 0 && valorCompra > 0 ? (valorCompra / vgv) * 100 : null;

  // Calculadora de permuta
  const unidadesPermuta = ticketMedio > 0 && valorCompra > 0
    ? Math.ceil((valorCompra * (percPermuta / 100)) / ticketMedio)
    : null;

  const valorPermuta = unidadesPermuta != null ? unidadesPermuta * ticketMedio : null;
  const valorDinheiro = valorPermuta != null ? valorCompra - valorPermuta : null;

  // Cenários comparativos
  const cenarios = [
    {
      label: "À Vista",
      forma: "DINHEIRO_VISTA" as FormaPagamento,
      prazo: 0,
      descricao: "Pagamento integral na assinatura",
    },
    {
      label: "Prazo (36m)",
      forma: "DINHEIRO_PRAZO" as FormaPagamento,
      prazo: 36,
      descricao: "Parcelado em 36 meses",
    },
    {
      label: "Permuta Física",
      forma: "PERMUTA_FISICA" as FormaPagamento,
      prazo: 0,
      descricao: "Pagamento com unidades do empreendimento",
    },
  ];

  async function salvarNoTerreno() {
    setSaving(true);
    await fetch(`/api/terrenos/${terreno.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...terreno,
        vgvEstimado: vgv || null,
        valorCompra: valorCompra || null,
        formaPagamento: forma || null,
        prazoPagamento: prazo || null,
        percentualPermuta: percPermuta || null,
        proprietarios: terreno.proprietarios?.map((p: any) => ({
          proprietarioId: p.proprietario.id,
          percentual: p.percentual,
          principal: p.principal,
        })) ?? [],
      }),
    });
    setSaving(false);
    onSave?.();
  }

  function FaixaBar() {
    if (pct == null) return null;
    const config = DEFAULT_SCORE_CONFIG;
    const cor = faixaVgvColor(
      pct <= config.faixaVerde ? "verde" : pct <= config.faixaAmarela ? "amarelo" : "vermelho"
    );
    const label =
      pct <= config.faixaVerde
        ? `Excelente — abaixo de ${config.faixaVerde}%`
        : pct <= config.faixaAmarela
        ? `Atenção — entre ${config.faixaVerde}% e ${config.faixaAmarela}%`
        : `Alto — acima de ${config.faixaAmarela}%`;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: cor }}>
            {label}
          </span>
          <span className="text-2xl font-bold" style={{ color: cor }}>
            {formatPercent(pct)}
          </span>
        </div>
        <div className="relative h-3 rounded-full bg-[#F7F7F7] overflow-hidden">
          {/* Faixas de referência */}
          <div
            className="absolute h-full rounded-full opacity-30"
            style={{ width: `${(config.faixaVerde / 25) * 100}%`, backgroundColor: "#16a34a" }}
          />
          <div
            className="absolute h-full opacity-30"
            style={{
              left: `${(config.faixaVerde / 25) * 100}%`,
              width: `${((config.faixaAmarela - config.faixaVerde) / 25) * 100}%`,
              backgroundColor: "#ca8a04",
            }}
          />
          {/* Indicador atual */}
          <div
            className="absolute h-full rounded-full transition-all"
            style={{
              width: `${Math.min((pct / 25) * 100, 100)}%`,
              backgroundColor: cor,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#A0A0A0]">
          <span>0%</span>
          <span className="text-green-600">{config.faixaVerde}%</span>
          <span className="text-yellow-600">{config.faixaAmarela}%</span>
          <span className="text-red-600">25%+</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-1 space-y-5">
        <div className="rounded-xl border border-black/8 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-black">Parâmetros</h2>

          <InputField label="VGV Estimado (R$)" hint="Valor Geral de Vendas do empreendimento">
            <input
              type="number"
              value={vgv || ""}
              onChange={(e) => setVgv(Number(e.target.value))}
              className={inputCls}
              placeholder="ex: 40.000.000"
            />
          </InputField>

          <InputField label="Valor de Compra (R$)" hint="Valor negociado com o proprietário">
            <input
              type="number"
              value={valorCompra || ""}
              onChange={(e) => setValorCompra(Number(e.target.value))}
              className={inputCls}
              placeholder="ex: 4.000.000"
            />
          </InputField>

          <InputField label="Forma de Pagamento">
            <select
              value={forma}
              onChange={(e) => setForma(e.target.value as FormaPagamento)}
              className={inputCls}
            >
              <option value="">Selecione</option>
              {Object.entries(FORMA_PAGAMENTO_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </InputField>

          <InputField label="Prazo (meses)">
            <input
              type="number"
              value={prazo || ""}
              onChange={(e) => setPrazo(Number(e.target.value))}
              className={inputCls}
              placeholder="ex: 36"
            />
          </InputField>

          <InputField label="% de Permuta" hint="Percentual do valor pago com unidades">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={percPermuta || ""}
              onChange={(e) => setPercPermuta(Number(e.target.value))}
              className={inputCls}
              placeholder="ex: 30"
            />
          </InputField>

          <InputField label="Ticket Médio das Unidades (R$)" hint="Para cálculo do simulador de permuta">
            <input
              type="number"
              value={ticketMedio || ""}
              onChange={(e) => setTicketMedio(Number(e.target.value))}
              className={inputCls}
              placeholder="ex: 500.000"
            />
          </InputField>

          <button
            onClick={salvarNoTerreno}
            disabled={saving}
            className="w-full h-9 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Salvando…" : "Salvar no Terreno"}
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="lg:col-span-2 space-y-5">
        {/* % Terreno/VGV */}
        <div className="rounded-xl border border-black/8 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-black">% Terreno / VGV</h2>
          <FaixaBar />

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center p-3 rounded-lg bg-[#F7F7F7]">
              <p className="text-xs text-[#606060] mb-1">Custo por Unidade</p>
              <p className="text-sm font-bold text-black">
                {terreno.numUnidadesEstimado && valorCompra
                  ? formatCurrency(valorCompra / terreno.numUnidadesEstimado)
                  : "—"}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#F7F7F7]">
              <p className="text-xs text-[#606060] mb-1">Custo por m²</p>
              <p className="text-sm font-bold text-black">
                {terreno.areaTerreno && valorCompra
                  ? formatCurrency(valorCompra / terreno.areaTerreno)
                  : "—"}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#F7F7F7]">
              <p className="text-xs text-[#606060] mb-1">Score</p>
              <div className="flex justify-center">
                <ScoreBadge score={scoreResult.score} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Simulador de permuta */}
        <div className="rounded-xl border border-black/8 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-black">Simulador de Permuta</h2>

          {unidadesPermuta != null && valorPermuta != null ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-[#FFF0E8] border border-[#F26522]/20">
                <p className="text-xs text-[#C2410C] mb-1">Unidades Permutadas</p>
                <p className="text-2xl font-bold text-[#F26522]">{unidadesPermuta}</p>
                <p className="text-xs text-[#C2410C] mt-1">apartamentos</p>
              </div>
              <div className="p-4 rounded-lg bg-[#F7F7F7]">
                <p className="text-xs text-[#606060] mb-1">Valor em Permuta</p>
                <p className="text-xl font-bold text-black">{formatCurrency(valorPermuta)}</p>
                <p className="text-xs text-[#606060] mt-1">
                  {ticketMedio > 0 ? `${formatCurrency(ticketMedio)}/unid` : ""}
                </p>
              </div>
              {valorDinheiro != null && valorDinheiro > 0 && (
                <div className="p-4 rounded-lg bg-[#F7F7F7] col-span-2">
                  <p className="text-xs text-[#606060] mb-1">Complemento em Dinheiro</p>
                  <p className="text-xl font-bold text-black">{formatCurrency(valorDinheiro)}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#A0A0A0] text-center py-4">
              Informe o valor de compra, % de permuta e ticket médio para calcular.
            </p>
          )}
        </div>

        {/* Comparação de cenários */}
        <div className="rounded-xl border border-black/8 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-black">Comparação de Cenários</h2>
          <p className="text-xs text-[#606060]">Score de negociação para o mesmo valor de compra</p>
          <div className="space-y-3">
            {cenarios.map((c) => {
              const s = calcularScore({
                valorCompra: valorCompra || null,
                vgvEstimado: vgv || null,
                formaPagamento: c.forma,
                prazoPagamento: c.prazo || null,
                riscoMatricula: terreno.matriculas?.[0]?.riscoOnus ?? null,
              });
              const isAtual = forma === c.forma;
              return (
                <div
                  key={c.label}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-colors",
                    isAtual
                      ? "border-[#F26522]/40 bg-[#FFF8F4]"
                      : "border-black/8 bg-white"
                  )}
                >
                  <div>
                    <p className={cn("text-sm font-semibold", isAtual ? "text-[#F26522]" : "text-black")}>
                      {c.label} {isAtual && <span className="text-xs ml-1">(atual)</span>}
                    </p>
                    <p className="text-xs text-[#606060]">{c.descricao}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-[#606060]">Impacto no caixa</p>
                      <p className="text-sm font-semibold text-black">
                        {c.forma === "PERMUTA_FISICA"
                          ? "Sem saída de caixa"
                          : c.forma === "DINHEIRO_PRAZO"
                          ? `${formatCurrency((valorCompra || 0) / Math.max(c.prazo, 1))}/mês`
                          : formatCurrency(valorCompra || 0)}
                      </p>
                    </div>
                    <ScoreBadge score={s.score} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
