import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const terrenoId = searchParams.get("terrenoId");
  const meses = parseInt(searchParams.get("meses") ?? "12");

  const inicio = new Date();
  inicio.setDate(1);
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date(inicio);
  fim.setMonth(fim.getMonth() + meses);

  const where: any = {
    vencimento: { gte: inicio, lt: fim },
  };
  if (terrenoId) where.terrenoId = terrenoId;

  const lancamentos = await prisma.lancamentoFinanceiro.findMany({ where });

  const mapaFluxo: Record<string, { mes: string; previsto: number; pago: number; atrasado: number }> = {};

  for (let i = 0; i < meses; i++) {
    const d = new Date(inicio);
    d.setMonth(d.getMonth() + i);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    mapaFluxo[chave] = { mes: label, previsto: 0, pago: 0, atrasado: 0 };
  }

  for (const l of lancamentos) {
    if (!l.vencimento) continue;
    const d = new Date(l.vencimento);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!mapaFluxo[chave]) continue;
    if (l.status === "PAGO") mapaFluxo[chave].pago += l.valor;
    else if (l.status === "ATRASADO") mapaFluxo[chave].atrasado += l.valor;
    else mapaFluxo[chave].previsto += l.valor;
  }

  return NextResponse.json(Object.values(mapaFluxo));
}
