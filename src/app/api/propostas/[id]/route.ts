import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

const AtualizarPropostaSchema = z.object({
  valorProposto: z.number().positive().optional().nullable(),
  formaPagamento: z.enum(["PERMUTA_FISICA", "PERMUTA_FINANCEIRA", "DINHEIRO_PRAZO", "DINHEIRO_VISTA", "MISTO"]).optional().nullable(),
  prazo: z.number().int().min(0).optional().nullable(),
  percentualPermuta: z.number().min(0).max(100).optional().nullable(),
  condicoesEspeciais: z.string().optional().nullable(),
  validade: z.string().optional().nullable(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const proposta = await prisma.proposta.findUnique({
    where: { id },
    include: {
      terreno: {
        include: {
          proprietarios: { include: { proprietario: true } },
          responsavel: { select: { id: true, nome: true, email: true } },
        },
      },
      criador: { select: { id: true, nome: true, email: true } },
      contratos: { select: { id: true, status: true, versao: true } },
    },
  });

  if (!proposta) return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
  return NextResponse.json(proposta);
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
  if (dbUser.role === "LEITURA") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const parsed = AtualizarPropostaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { validade, ...rest } = parsed.data;

  const proposta = await prisma.$transaction(async (tx) => {
    const p = await tx.proposta.update({
      where: { id },
      data: {
        ...rest,
        validade: validade !== undefined ? (validade ? new Date(validade) : null) : undefined,
      },
    });

    await tx.auditLog.create({
      data: {
        usuarioId: dbUser.id,
        terrenoId: p.terrenoId,
        tipo: "UPDATE",
        entidade: "proposta",
        entidadeId: id,
        descricao: `Proposta v${p.versao} atualizada`,
        camposAlterados: rest as any,
      },
    });

    return p;
  });

  return NextResponse.json(proposta);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  if (!["ADMIN", "GESTOR"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Apenas Gestor ou Admin podem excluir propostas" }, { status: 403 });
  }

  const { id } = await params;
  const proposta = await prisma.proposta.findUnique({ where: { id } });
  if (!proposta) return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
  if (proposta.status !== "RASCUNHO") {
    return NextResponse.json({ error: "Apenas propostas em rascunho podem ser excluídas" }, { status: 422 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.auditLog.create({
      data: {
        usuarioId: dbUser.id,
        terrenoId: proposta.terrenoId,
        tipo: "DELETE",
        entidade: "proposta",
        entidadeId: id,
        descricao: `Proposta v${proposta.versao} excluída`,
      },
    });
    await tx.proposta.delete({ where: { id } });
  });

  return NextResponse.json({ ok: true });
}
