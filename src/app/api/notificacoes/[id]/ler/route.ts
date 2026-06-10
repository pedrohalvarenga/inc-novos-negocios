import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.notificacao.update({ where: { id }, data: { lida: true } });
  return NextResponse.json({ ok: true });
}
