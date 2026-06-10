import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { CorretorSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const busca = searchParams.get("busca");

  const corretores = await prisma.corretor.findMany({
    where: busca
      ? { nome: { contains: busca, mode: "insensitive" } }
      : undefined,
    orderBy: { nome: "asc" },
    take: 50,
  });

  return NextResponse.json(corretores);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser || dbUser.role === "LEITURA") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = CorretorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const corretor = await prisma.corretor.create({
    data: { ...parsed.data, createdBy: dbUser.id },
  });

  return NextResponse.json(corretor, { status: 201 });
}
