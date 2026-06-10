import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";

export async function GET(_: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);

  const usuario = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!usuario) return NextResponse.json([]);

  const notificacoes = await prisma.notificacao.findMany({
    where: { usuarioId: usuario.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notificacoes);
}
