import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gerarOcorrencias } from "@/lib/financeiro/recorrencias";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const terrenoId = searchParams.get("terrenoId");
  const status = searchParams.get("status");
  const tipo = searchParams.get("tipo");
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");

  const where: any = {};
  if (terrenoId) where.terrenoId = terrenoId;
  if (status) where.status = status;
  if (tipo) where.tipo = tipo;
  if (de || ate) {
    where.vencimento = {};
    if (de) where.vencimento.gte = new Date(de);
    if (ate) where.vencimento.lte = new Date(ate);
  }

  const lancamentos = await prisma.lancamentoFinanceiro.findMany({
    where,
    include: { terreno: { select: { id: true, nome: true, bairro: true } } },
    orderBy: [
      { status: "asc" },
      { vencimento: "asc" },
    ],
  });

  return NextResponse.json(lancamentos);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await req.json();
  const { recorrenciaConfig, ...rest } = body;

  const usuario = user
    ? await prisma.usuario.findUnique({ where: { supabaseId: user.id } })
    : null;
  const createdBy = usuario?.id ?? "sistema";

  const lancamento = await prisma.lancamentoFinanceiro.create({
    data: {
      ...rest,
      recorrenciaConfig: recorrenciaConfig ?? undefined,
      createdBy,
    },
  });

  if (recorrenciaConfig && recorrenciaConfig.totalParcelas > 1) {
    await gerarOcorrencias(lancamento.id, recorrenciaConfig);
  }

  return NextResponse.json(lancamento, { status: 201 });
}
