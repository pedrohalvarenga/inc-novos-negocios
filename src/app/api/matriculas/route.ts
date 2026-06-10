import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

const CreateSchema = z.object({
  terrenoId: z.string().min(1),
  numero: z.string().optional(),
  cartorio: z.string().optional(),
  comarca: z.string().optional(),
  observacoes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const terrenoId = searchParams.get("terrenoId");

  const matriculas = await prisma.matricula.findMany({
    where: terrenoId ? { terrenoId } : undefined,
    include: { terreno: { select: { nome: true, cidade: true, uf: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(matriculas);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  const body = await request.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const terreno = await prisma.terreno.findUnique({ where: { id: parsed.data.terrenoId } });
  if (!terreno) return NextResponse.json({ error: "Terreno não encontrado" }, { status: 404 });

  const matricula = await prisma.matricula.create({
    data: {
      terrenoId: parsed.data.terrenoId,
      numero: parsed.data.numero,
      cartorio: parsed.data.cartorio,
      comarca: parsed.data.comarca,
      observacoes: parsed.data.observacoes,
      createdBy: dbUser.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      usuarioId: dbUser.id,
      terrenoId: parsed.data.terrenoId,
      tipo: "CREATE",
      entidade: "matricula",
      entidadeId: matricula.id,
      descricao: "Matrícula criada",
    },
  });

  return NextResponse.json(matricula, { status: 201 });
}
