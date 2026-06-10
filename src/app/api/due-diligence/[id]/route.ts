import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

const UpdateSchema = z.object({
  fonte: z.string().optional().nullable(),
  resultado: z.any().optional(),
  checklist: z.array(z.object({
    item: z.string(),
    status: z.enum(["PENDENTE", "OK", "ALERTA", "CRITICO"]),
    data: z.string().optional(),
    evidencia: z.string().optional(),
    fonte: z.string().optional(),
  })).optional(),
  resumo: z.string().optional().nullable(),
  score: z.number().min(0).max(100).optional().nullable(),
  dataAnalise: z.string().optional().nullable(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const dd = await prisma.dueDiligence.findUnique({
    where: { id },
    include: {
      proprietario: { select: { nomeRazaoSocial: true, cpfCnpj: true, telefone: true, email: true } },
      terreno: { select: { nome: true, cidade: true, uf: true } },
    },
  });

  if (!dd) return NextResponse.json({ error: "Due Diligence não encontrada" }, { status: 404 });
  return NextResponse.json(dd);
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

  const dd = await prisma.dueDiligence.findUnique({ where: { id } });
  if (!dd) return NextResponse.json({ error: "Due Diligence não encontrada" }, { status: 404 });

  const updated = await prisma.dueDiligence.update({
    where: { id },
    data: {
      fonte: parsed.data.fonte !== undefined ? parsed.data.fonte : undefined,
      resultado: parsed.data.resultado !== undefined ? parsed.data.resultado : undefined,
      checklist: parsed.data.checklist !== undefined ? (parsed.data.checklist as any) : undefined,
      resumo: parsed.data.resumo !== undefined ? parsed.data.resumo : undefined,
      score: parsed.data.score !== undefined ? parsed.data.score : undefined,
      dataAnalise: parsed.data.dataAnalise ? new Date(parsed.data.dataAnalise) : undefined,
    },
    include: {
      proprietario: { select: { nomeRazaoSocial: true, cpfCnpj: true } },
    },
  });

  await prisma.auditLog.create({
    data: {
      usuarioId: dbUser.id,
      terrenoId: dd.terrenoId,
      tipo: "UPDATE",
      entidade: "due_diligence",
      entidadeId: id,
      descricao: "Due Diligence atualizada",
    },
  });

  return NextResponse.json(updated);
}
