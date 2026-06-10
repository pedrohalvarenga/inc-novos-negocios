import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.notificacao.update({ where: { id: params.id }, data: { lida: true } });
  return NextResponse.json({ ok: true });
}
