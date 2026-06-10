import type { FormaPagamento } from "@prisma/client";

export interface ScoreConfig {
  pesoVgv: number;         // padrão 40
  pesoPagamento: number;   // padrão 25
  pesoPrazo: number;       // padrão 20
  pesoRisco: number;       // padrão 15
  faixaVerde: number;      // % terreno/VGV — até aqui verde (padrão 10)
  faixaAmarela: number;    // % terreno/VGV — até aqui amarelo (padrão 15)
}

export const DEFAULT_SCORE_CONFIG: ScoreConfig = {
  pesoVgv: 40,
  pesoPagamento: 25,
  pesoPrazo: 20,
  pesoRisco: 15,
  faixaVerde: 10,
  faixaAmarela: 15,
};

function pontuacaoVgv(percentualTerreno: number, config: ScoreConfig): number {
  // Menor % = melhor negócio. 0% = 100pts, faixaVerde = 80pts, faixaAmarela = 50pts, >20% = 0pts
  if (percentualTerreno <= 0) return 100;
  if (percentualTerreno <= config.faixaVerde) {
    return 100 - (percentualTerreno / config.faixaVerde) * 20;
  }
  if (percentualTerreno <= config.faixaAmarela) {
    const range = config.faixaAmarela - config.faixaVerde;
    const above = percentualTerreno - config.faixaVerde;
    return 80 - (above / range) * 30;
  }
  if (percentualTerreno <= 20) {
    return 50 - ((percentualTerreno - config.faixaAmarela) / (20 - config.faixaAmarela)) * 50;
  }
  return 0;
}

function pontuacaoPagamento(forma: FormaPagamento | null | undefined): number {
  switch (forma) {
    case "PERMUTA_FISICA":    return 100;
    case "PERMUTA_FINANCEIRA": return 85;
    case "MISTO":             return 70;
    case "DINHEIRO_PRAZO":    return 50;
    case "DINHEIRO_VISTA":    return 20;
    default:                  return 0;
  }
}

function pontuacaoPrazo(meses: number | null | undefined): number {
  if (!meses) return 0;
  if (meses >= 60)  return 100;
  if (meses >= 36)  return 80;
  if (meses >= 24)  return 60;
  if (meses >= 12)  return 40;
  if (meses >= 6)   return 20;
  return 10;
}

export interface ScoreInput {
  valorCompra: number | null | undefined;
  vgvEstimado: number | null | undefined;
  formaPagamento: FormaPagamento | null | undefined;
  prazoPagamento: number | null | undefined;
  config?: ScoreConfig;
}

export interface ScoreResult {
  score: number;
  percentualTerreno: number | null;
  pontuacaoVgv: number;
  pontuacaoPagamento: number;
  pontuacaoPrazo: number;
  pontuacaoRisco: number;
  faixa: "verde" | "amarelo" | "vermelho" | "sem-dados";
}

export function calcularScore(input: ScoreInput): ScoreResult {
  const config = input.config ?? DEFAULT_SCORE_CONFIG;

  const percentualTerreno =
    input.valorCompra && input.vgvEstimado && input.vgvEstimado > 0
      ? (input.valorCompra / input.vgvEstimado) * 100
      : null;

  const pvgv = percentualTerreno != null ? pontuacaoVgv(percentualTerreno, config) : 0;
  const ppag = pontuacaoPagamento(input.formaPagamento);
  const pprazo = pontuacaoPrazo(input.prazoPagamento);
  const prisco = 50; // neutro nesta fase

  const total = (pvgv * config.pesoVgv + ppag * config.pesoPagamento + pprazo * config.pesoPrazo + prisco * config.pesoRisco) / 100;

  let faixa: ScoreResult["faixa"] = "sem-dados";
  if (percentualTerreno != null) {
    if (percentualTerreno <= config.faixaVerde) faixa = "verde";
    else if (percentualTerreno <= config.faixaAmarela) faixa = "amarelo";
    else faixa = "vermelho";
  }

  return {
    score: Math.round(Math.max(0, Math.min(100, total))),
    percentualTerreno,
    pontuacaoVgv: pvgv,
    pontuacaoPagamento: ppag,
    pontuacaoPrazo: pprazo,
    pontuacaoRisco: prisco,
    faixa,
  };
}

export function scoreColor(score: number): string {
  if (score >= 70) return "#16a34a"; // verde
  if (score >= 45) return "#ca8a04"; // amarelo
  return "#dc2626"; // vermelho
}

export function faixaVgvColor(faixa: ScoreResult["faixa"]): string {
  switch (faixa) {
    case "verde":    return "#16a34a";
    case "amarelo":  return "#ca8a04";
    case "vermelho": return "#dc2626";
    default:         return "#606060";
  }
}
