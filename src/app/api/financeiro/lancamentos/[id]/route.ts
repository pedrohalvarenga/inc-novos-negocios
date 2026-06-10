import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const l = await prisma.lancamentoFinanceiro.findUnique({
    where: { id: params.id },
    include: { terreno: { select: { id: true, nome: true } }, contrato: { select: { id: true } } },
  });
  if (!l) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(l);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const l = await prisma.lancamentoFinanceiro.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(l);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.lancamentoFinanceiro.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
