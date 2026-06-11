import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { STATUS_TERRENO_LABELS, STATUS_TERRENO_ORDER } from "@/lib/constants";
import { calcularScore } from "@/lib/score";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const [terrenos, propostas] = await Promise.all([
    prisma.terreno.findMany({
      include: {
        statusHistorico: { orderBy: { createdAt: "asc" } },
        criador: { select: { id: true, nome: true } },
        responsavel: { select: { id: true, nome: true } },
        matriculas: { orderBy: { updatedAt: "desc" }, take: 1, select: { riscoOnus: true } },
      },
    }),
    prisma.proposta.findMany({
      where: { status: { in: ["RASCUNHO", "ENVIADA", "EM_NEGOCIACAO"] } },
    }),
  ]);

  // KPIs
  const emNegociacao = terrenos.filter((t) => t.status === "EM_NEGOCIACAO").length;
  const contratosEmElab = terrenos.filter((t) => t.status === "CONTRATO_EM_ELABORACAO").length;
  const contratosAssinados = terrenos.filter((t) => t.status === "CONTRATO_ASSINADO").length;
  const ativos = terrenos.filter((t) => t.status !== "DESCARTADO");

  const vgvTotal = ativos.reduce((s, t) => s + (t.vgvEstimado ?? 0), 0);
  const valorCompraTotal = ativos.reduce((s, t) => s + (t.valorCompra ?? 0), 0);
  const totalUnidades = ativos.reduce((s, t) => s + (t.numUnidadesEstimado ?? 0), 0);

  const pcts = ativos
    .filter((t) => t.valorCompra && t.vgvEstimado && t.vgvEstimado > 0)
    .map((t) => (t.valorCompra! / t.vgvEstimado!) * 100);
  const pctMedio = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;

  // Funil
  const funil = STATUS_TERRENO_ORDER.map((s) => {
    const group = terrenos.filter((t) => t.status === s);
    return {
      status: s,
      label: STATUS_TERRENO_LABELS[s],
      quantidade: group.length,
      vgv: group.reduce((sum, t) => sum + (t.vgvEstimado ?? 0), 0),
    };
  });

  // Por cidade
  const cidadeMap: Record<string, { terrenos: number; unidades: number; vgv: number; uf: string }> = {};
  for (const t of ativos) {
    if (!cidadeMap[t.cidade]) cidadeMap[t.cidade] = { terrenos: 0, unidades: 0, vgv: 0, uf: t.uf };
    cidadeMap[t.cidade].terrenos++;
    cidadeMap[t.cidade].unidades += t.numUnidadesEstimado ?? 0;
    cidadeMap[t.cidade].vgv += t.vgvEstimado ?? 0;
  }
  const cidades = Object.entries(cidadeMap)
    .map(([cidade, v]) => ({ cidade, ...v }))
    .sort((a, b) => b.vgv - a.vgv);

  // Tempo médio por etapa
  const now = Date.now();
  const tempoEtapas: Record<string, number[]> = {};
  for (const t of terrenos) {
    const hist = t.statusHistorico.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    for (let i = 0; i < hist.length; i++) {
      const entrada = hist[i].createdAt.getTime();
      const saida = i + 1 < hist.length ? hist[i + 1].createdAt.getTime() : now;
      const dias = (saida - entrada) / 86400000;
      const s = hist[i].statusNovo;
      if (!tempoEtapas[s]) tempoEtapas[s] = [];
      tempoEtapas[s].push(dias);
    }
  }
  const tempoMedioEtapas = STATUS_TERRENO_ORDER.map((s) => {
    const vals = tempoEtapas[s] ?? [];
    return {
      status: s,
      label: STATUS_TERRENO_LABELS[s],
      diasMedio: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0,
    };
  });

  // Tabela resumo com score
  const tabelaTerrenos = terrenos
    .filter((t) => t.status !== "DESCARTADO")
    .map((t) => {
      const { score, percentualTerreno } = calcularScore({
        valorCompra: t.valorCompra,
        vgvEstimado: t.vgvEstimado,
        formaPagamento: t.formaPagamento,
        prazoPagamento: t.prazoPagamento,
        riscoMatricula: t.matriculas[0]?.riscoOnus ?? null,
      });
      const ultima = [...t.statusHistorico].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      const diasNaEtapa = ultima
        ? Math.floor((now - ultima.createdAt.getTime()) / 86400000)
        : Math.floor((now - t.createdAt.getTime()) / 86400000);

      return {
        id: t.id,
        nome: t.nome,
        cidade: t.cidade,
        uf: t.uf,
        status: t.status,
        numUnidadesEstimado: t.numUnidadesEstimado,
        vgvEstimado: t.vgvEstimado,
        valorCompra: t.valorCompra,
        percentualTerreno,
        formaPagamento: t.formaPagamento,
        score,
        diasNaEtapa,
        criador: t.criador,
        responsavel: t.responsavel,
      };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return NextResponse.json({
    kpis: {
      terrenosEmNegociacao: emNegociacao,
      propostasAtivas: propostas.length,
      contratosEmElaboracao: contratosEmElab,
      contratosAssinados,
      vgvTotalPipeline: vgvTotal,
      valorTotalCompra: valorCompraTotal,
      percentualMedioTerreno: pctMedio,
      totalUnidades,
    },
    funil,
    cidades,
    tempoMedioEtapas,
    tabelaTerrenos,
  });
}
