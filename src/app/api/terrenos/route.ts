import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { TerrenoSchema } from "@/lib/validations";
import { calcularScore } from "@/lib/score";
import type { StatusTerreno } from "@prisma/client";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as StatusTerreno | null;
  const cidade = searchParams.get("cidade");
  const formaPagamento = searchParams.get("formaPagamento");
  const responsavelId = searchParams.get("responsavelId");
  const busca = searchParams.get("busca");

  const terrenos = await prisma.terreno.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(cidade ? { cidade: { contains: cidade, mode: "insensitive" } } : {}),
      ...(formaPagamento ? { formaPagamento: formaPagamento as any } : {}),
      ...(responsavelId ? { responsavelId } : {}),
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca, mode: "insensitive" } },
              { cidade: { contains: busca, mode: "insensitive" } },
              { bairro: { contains: busca, mode: "insensitive" } },
              { apelido: { contains: busca, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      criador: { select: { id: true, nome: true, email: true } },
      responsavel: { select: { id: true, nome: true, email: true } },
      statusHistorico: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { propostas: true, contratos: true } },
      matriculas: { orderBy: { updatedAt: "desc" }, take: 1, select: { riscoOnus: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Adiciona score e dias na etapa
  const now = Date.now();
  const result = terrenos.map((t) => {
    const { score } = calcularScore({
      valorCompra: t.valorCompra,
      vgvEstimado: t.vgvEstimado,
      formaPagamento: t.formaPagamento,
      prazoPagamento: t.prazoPagamento,
      riscoMatricula: t.matriculas[0]?.riscoOnus ?? null,
    });
    const ultima = t.statusHistorico[0];
    const diasNaEtapa = ultima
      ? Math.floor((now - ultima.createdAt.getTime()) / 86400000)
      : Math.floor((now - t.createdAt.getTime()) / 86400000);

    return { ...t, score, diasNaEtapa };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  if (dbUser.role === "LEITURA") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = TerrenoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { proprietarios, ...data } = parsed.data;

  const terreno = await prisma.$transaction(async (tx) => {
    const t = await tx.terreno.create({
      data: {
        ...data,
        dataProspeccao: data.dataProspeccao ? new Date(data.dataProspeccao) : new Date(),
        createdBy: dbUser.id,
      },
    });

    // Registra status inicial
    await tx.terrenoStatusHistorico.create({
      data: {
        terrenoId: t.id,
        statusNovo: t.status,
        createdBy: dbUser.id,
      },
    });

    // Vincula proprietários
    if (proprietarios?.length) {
      await tx.terrenoProprietario.createMany({
        data: proprietarios.map((p) => ({
          terrenoId: t.id,
          proprietarioId: p.proprietarioId,
          percentual: p.percentual,
          principal: p.principal,
        })),
      });
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        usuarioId: dbUser.id,
        terrenoId: t.id,
        tipo: "CREATE",
        entidade: "terreno",
        entidadeId: t.id,
        descricao: `Terreno "${t.nome}" criado`,
      },
    });

    return t;
  });

  return NextResponse.json(terreno, { status: 201 });
}
