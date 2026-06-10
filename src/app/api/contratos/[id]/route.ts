import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";
import type { ClausulasContrato, ClausulaHistoricoEntry } from "@/lib/contratos/template";

const AtualizarClausulaSchema = z.object({
  clausulaKey: z.string().min(1),
  conteudo: z.string(),
  justificativa: z.string().optional().default(""),
  autorNome: z.string().optional().default(""),
});

const AtualizarObservacoesSchema = z.object({
  observacoes: z.string().optional().nullable(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: {
      terreno: {
        include: {
          proprietarios: { include: { proprietario: true } },
          responsavel: { select: { id: true, nome: true, email: true } },
          corretor: true,
        },
      },
      proposta: true,
      lancamentos: { orderBy: { vencimento: "asc" } },
    },
  });

  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
  return NextResponse.json(contrato);
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

  // Suporta dois tipos de update: cláusula individual ou observações
  if (body.clausulaKey !== undefined) {
    const parsed = AtualizarClausulaSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { clausulaKey, conteudo, justificativa, autorNome } = parsed.data;

    const contrato = await prisma.contrato.findUnique({ where: { id } });
    if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });

    const clausulas = (contrato.clausulas ?? {}) as unknown as ClausulasContrato;
    const clausulaAtual = clausulas[clausulaKey];
    if (!clausulaAtual) return NextResponse.json({ error: "Cláusula não encontrada" }, { status: 404 });

    const novaEntrada: ClausulaHistoricoEntry = {
      conteudoAnterior: clausulaAtual.conteudo,
      conteudoNovo: conteudo,
      autor: autorNome || dbUser.nome,
      justificativa: justificativa,
      data: new Date().toISOString(),
    };

    clausulas[clausulaKey] = {
      ...clausulaAtual,
      conteudo,
      historico: [...(clausulaAtual.historico ?? []), novaEntrada],
      analise: null, // Limpa análise ao editar (será reanalisada)
    };

    const atualizado = await prisma.$transaction(async (tx) => {
      const c = await tx.contrato.update({
        where: { id },
        data: { clausulas: clausulas as any },
      });

      await tx.auditLog.create({
        data: {
          usuarioId: dbUser.id,
          terrenoId: c.terrenoId,
          tipo: "UPDATE",
          entidade: "contrato_clausula",
          entidadeId: id,
          descricao: `Cláusula "${clausulaKey}" editada${justificativa ? `: ${justificativa}` : ""}`,
        },
      });

      return c;
    });

    return NextResponse.json(atualizado);
  }

  // Atualiza observações
  const parsed = AtualizarObservacoesSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const contrato = await prisma.contrato.update({
    where: { id },
    data: { observacoes: parsed.data.observacoes },
  });

  return NextResponse.json(contrato);
}
