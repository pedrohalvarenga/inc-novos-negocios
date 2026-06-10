import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { ProprietarioSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const busca = searchParams.get("busca");

  const proprietarios = await prisma.proprietario.findMany({
    where: busca
      ? {
          OR: [
            { nomeRazaoSocial: { contains: busca, mode: "insensitive" } },
            { cpfCnpj: { contains: busca } },
          ],
        }
      : undefined,
    orderBy: { nomeRazaoSocial: "asc" },
    take: 50,
  });

  return NextResponse.json(proprietarios);
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
  const parsed = ProprietarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const proprietario = await prisma.proprietario.create({
    data: { ...parsed.data, createdBy: dbUser.id },
  });

  return NextResponse.json(proprietario, { status: 201 });
}
