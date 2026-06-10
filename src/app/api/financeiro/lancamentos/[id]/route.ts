import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = await prisma.lancamentoFinanceiro.findUnique({
    where: { id },
    include: { terreno: { select: { id: true, nome: true } }, contrato: { select: { id: true } } },
  });
  if (!l) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(l);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const l = await prisma.lancamentoFinanceiro.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(l);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.lancamentoFinanceiro.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
