import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gerarHtmlRelatorioFinanceiro } from "@/lib/financeiro/pdfRelatorio";

export async function GET(_: NextRequest, { params }: { params: { terrenoId: string } }) {
  const terreno = await prisma.terreno.findUnique({ where: { id: params.terrenoId } });
  if (!terreno) return NextResponse.json({ error: "Terreno não encontrado" }, { status: 404 });

  const lancamentos = await prisma.lancamentoFinanceiro.findMany({
    where: { terrenoId: params.terrenoId },
    orderBy: { vencimento: "asc" },
  });

  const html = gerarHtmlRelatorioFinanceiro(terreno, lancamentos);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
