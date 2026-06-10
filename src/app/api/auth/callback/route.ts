import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);

    if (user) {
      // Garante que existe registro no banco
      await prisma.usuario.upsert({
        where: { supabaseId: user.id },
        update: { email: user.email ?? "" },
        create: {
          supabaseId: user.id,
          nome: user.user_metadata?.nome ?? user.email?.split("@")[0] ?? "Usuário",
          email: user.email ?? "",
          role: "ANALISTA",
        },
      });
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
