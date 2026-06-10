import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const cfg = await prisma.configuracao.findUnique({ where: { chave: "zenkit_mapeamento" } });
  return NextResponse.json(cfg?.valor ?? null);
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const usuario = user ? await prisma.usuario.findUnique({ where: { supabaseId: user.id } }) : null;
  if (!usuario || usuario.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas Admin pode alterar o mapeamento" }, { status: 403 });
  }

  const body = await req.json();
  const cfg = await prisma.configuracao.upsert({
    where: { chave: "zenkit_mapeamento" },
    create: { chave: "zenkit_mapeamento", valor: body, updatedBy: usuario.id },
    update: { valor: body, updatedBy: usuario.id },
  });
  return NextResponse.json(cfg.valor);
}
