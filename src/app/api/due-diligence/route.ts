import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";
import { gerarChecklistInicial } from "@/lib/due-diligence/providers/interface";

const CreateSchema = z.object({
  proprietarioId: z.string().min(1),
  terrenoId: z.string().optional(),
  tipo: z.enum(["CPF", "CNPJ"]),
  fonte: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const terrenoId = searchParams.get("terrenoId");
  const proprietarioId = searchParams.get("proprietarioId");
  const risco = searchParams.get("risco");
  const status = searchParams.get("status");

  const dueDiligences = await prisma.dueDiligence.findMany({
    where: {
      ...(terrenoId ? { terrenoId } : {}),
      ...(proprietarioId ? { proprietarioId } : {}),
    },
    include: {
      proprietario: { select: { nomeRazaoSocial: true, cpfCnpj: true } },
      terreno: { select: { nome: true, cidade: true, uf: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(dueDiligences);
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

  const proprietario = await prisma.proprietario.findUnique({ where: { id: parsed.data.proprietarioId } });
  if (!proprietario) return NextResponse.json({ error: "Proprietário não encontrado" }, { status: 404 });

  const checklist = gerarChecklistInicial(parsed.data.tipo);

  const dd = await prisma.dueDiligence.create({
    data: {
      proprietarioId: parsed.data.proprietarioId,
      terrenoId: parsed.data.terrenoId,
      tipo: parsed.data.tipo,
      fonte: parsed.data.fonte,
      checklist: checklist as any,
      createdBy: dbUser.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      usuarioId: dbUser.id,
      terrenoId: parsed.data.terrenoId,
      tipo: "CREATE",
      entidade: "due_diligence",
      entidadeId: dd.id,
      descricao: `Due Diligence criada para ${proprietario.nomeRazaoSocial}`,
    },
  });

  return NextResponse.json(dd, { status: 201 });
}
