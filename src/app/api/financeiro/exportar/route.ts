import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lancamentosParaCsv } from "@/lib/financeiro/exportarCsv";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const terrenoId = searchParams.get("terrenoId");

  const where: any = {};
  if (terrenoId) where.terrenoId = terrenoId;

  const lancamentos = await prisma.lancamentoFinanceiro.findMany({
    where,
    include: { terreno: { select: { nome: true } } },
    orderBy: { vencimento: "asc" },
  });

  const csv = lancamentosParaCsv(lancamentos);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lancamentos.csv"`,
    },
  });
}
