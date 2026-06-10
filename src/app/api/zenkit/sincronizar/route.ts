import { NextRequest, NextResponse } from "next/server";
import { sincronizarZenkit } from "@/lib/zenkit/sincronizar";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function POST(_: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const usuario = user ? await prisma.usuario.findUnique({ where: { supabaseId: user.id } }) : null;
  if (!usuario || !["GESTOR", "ADMIN"].includes(usuario.role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const resultado = await sincronizarZenkit(usuario.id);
    return NextResponse.json(resultado);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
