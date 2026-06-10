import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";
import type { StatusProposta, FormaPagamento } from "@prisma/client";

const CriarPropostaSchema = z.object({
  terrenoId: z.string().min(1),
  valorProposto: z.number().positive().optional().nullable(),
  formaPagamento: z.enum(["PERMUTA_FISICA", "PERMUTA_FINANCEIRA", "DINHEIRO_PRAZO", "DINHEIRO_VISTA", "MISTO"]).optional().nullable(),
  prazo: z.number().int().min(0).optional().nullable(),
  percentualPermuta: z.number().min(0).max(100).optional().nullable(),
  condicoesEspeciais: z.string().optional().nullable(),
  validade: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const terrenoId = searchParams.get("terrenoId");
  const status = searchParams.get("status") as StatusProposta | null;
  const responsavelId = searchParams.get("responsavelId");
  const dataInicio = searchParams.get("dataInicio");
  const dataFim = searchParams.get("dataFim");
  const busca = searchParams.get("busca");

  const propostas = await prisma.proposta.findMany({
    where: {
      ...(terrenoId ? { terrenoId } : {}),
      ...(status ? { status } : {}),
      ...(dataInicio || dataFim ? {
        createdAt: {
          ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
          ...(dataFim ? { lte: new Date(dataFim + "T23:59:59") } : {}),
        },
      } : {}),
      ...(busca ? {
        terreno: {
          OR: [
            { nome: { contains: busca, mode: "insensitive" } },
            { cidade: { contains: busca, mode: "insensitive" } },
          ],
        },
      } : {}),
    },
    include: {
      terreno: {
        select: {
          id: true,
          nome: true,
          bairro: true,
          cidade: true,
          uf: true,
          responsavel: { select: { id: true, nome: true } },
        },
      },
      criador: { select: { id: true, nome: true } },
      _count: { select: { contratos: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filtra por responsável no terreno
  const resultado = responsavelId
    ? propostas.filter((p) => (p.terreno as any).responsavel?.id === responsavelId)
    : propostas;

  return NextResponse.json(resultado);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  if (dbUser.role === "LEITURA") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await request.json();
  const parsed = CriarPropostaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { terrenoId, validade, ...rest } = parsed.data;

  // Calcula a próxima versão para esse terreno
  const ultimaVersao = await prisma.proposta.findFirst({
    where: { terrenoId },
    orderBy: { versao: "desc" },
    select: { versao: true },
  });
  const novaVersao = (ultimaVersao?.versao ?? 0) + 1;

  const proposta = await prisma.$transaction(async (tx) => {
    const p = await tx.proposta.create({
      data: {
        terrenoId,
        versao: novaVersao,
        ...rest,
        validade: validade ? new Date(validade) : null,
        createdBy: dbUser.id,
      },
    });

    await tx.auditLog.create({
      data: {
        usuarioId: dbUser.id,
        terrenoId,
        tipo: "CREATE",
        entidade: "proposta",
        entidadeId: p.id,
        descricao: `Proposta v${novaVersao} criada para terreno ${terrenoId}`,
      },
    });

    return p;
  });

  return NextResponse.json(proposta, { status: 201 });
}
