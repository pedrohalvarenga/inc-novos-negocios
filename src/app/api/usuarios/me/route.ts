import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Upsert garante que o usuário existe no banco após primeiro login
  const dbUser = await prisma.usuario.upsert({
    where: { supabaseId: user.id },
    update: { email: user.email ?? "" },
    create: {
      supabaseId: user.id,
      nome: user.user_metadata?.nome ?? user.email?.split("@")[0] ?? "Usuário",
      email: user.email ?? "",
      role: "ANALISTA",
    },
    select: { id: true, nome: true, email: true, role: true },
  });

  return NextResponse.json(dbUser);
}
