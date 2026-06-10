import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

const UpdateSchema = z.object({
  numero: z.string().optional().nullable(),
  cartorio: z.string().optional().nullable(),
  comarca: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  arquivos: z.array(z.object({
    nome: z.string(),
    tipo: z.string(),
    tamanho: z.number(),
    storagePath: z.string().optional(),
  })).optional().nullable(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const matricula = await prisma.matricula.findUnique({
    where: { id },
    include: { terreno: { select: { nome: true, cidade: true, uf: true } } },
  });

  if (!matricula) return NextResponse.json({ error: "Matrícula não encontrada" }, { status: 404 });
  return NextResponse.json(matricula);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const matricula = await prisma.matricula.findUnique({ where: { id } });
  if (!matricula) return NextResponse.json({ error: "Matrícula não encontrada" }, { status: 404 });

  const updated = await prisma.matricula.update({
    where: { id },
    data: {
      numero: parsed.data.numero !== undefined ? parsed.data.numero : undefined,
      cartorio: parsed.data.cartorio !== undefined ? parsed.data.cartorio : undefined,
      comarca: parsed.data.comarca !== undefined ? parsed.data.comarca : undefined,
      observacoes: parsed.data.observacoes !== undefined ? parsed.data.observacoes : undefined,
      arquivos: parsed.data.arquivos !== undefined ? (parsed.data.arquivos as any) : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      usuarioId: dbUser.id,
      terrenoId: matricula.terrenoId,
      tipo: "UPDATE",
      entidade: "matricula",
      entidadeId: id,
      descricao: "Matrícula atualizada",
    },
  });

  return NextResponse.json(updated);
}
