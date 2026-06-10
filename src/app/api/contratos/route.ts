import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";
import { gerarClausulasIniciais } from "@/lib/contratos/template";

const CriarContratoSchema = z.object({
  terrenoId: z.string().min(1),
  propostaId: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const terrenoId = searchParams.get("terrenoId");
  const status = searchParams.get("status");
  const busca = searchParams.get("busca");

  const contratos = await prisma.contrato.findMany({
    where: {
      ...(terrenoId ? { terrenoId } : {}),
      ...(status ? { status: status as any } : {}),
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
          proprietarios: { include: { proprietario: { select: { nomeRazaoSocial: true } } }, take: 1 },
        },
      },
      proposta: { select: { id: true, versao: true, valorProposto: true, formaPagamento: true } },
      _count: { select: { lancamentos: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(contratos);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  if (dbUser.role === "LEITURA") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await request.json();
  const parsed = CriarContratoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { terrenoId, propostaId, observacoes } = parsed.data;

  // Busca dados do terreno para pré-preencher variáveis
  const terreno = await prisma.terreno.findUnique({
    where: { id: terrenoId },
    include: {
      proprietarios: { include: { proprietario: true }, where: { principal: true }, take: 1 },
    },
  });
  if (!terreno) return NextResponse.json({ error: "Terreno não encontrado" }, { status: 404 });

  // Busca dados da proposta se fornecida
  let proposta = null;
  if (propostaId) {
    proposta = await prisma.proposta.findUnique({ where: { id: propostaId } });
  }

  const proprietarioPrincipal = terreno.proprietarios[0]?.proprietario;

  const vars: Record<string, string> = {
    "vendedor.nome": proprietarioPrincipal?.nomeRazaoSocial ?? "",
    "vendedor.cpf_cnpj": proprietarioPrincipal?.cpfCnpj ?? "",
    "terreno.endereco": [terreno.logradouro, terreno.numero, terreno.bairro, `${terreno.cidade}/${terreno.uf}`].filter(Boolean).join(", "),
    "terreno.area": terreno.areaTerreno.toString(),
    "terreno.cidade": terreno.cidade,
    "terreno.uf": terreno.uf,
  };

  if (proposta) {
    if (proposta.valorProposto) vars["valor"] = `R$ ${proposta.valorProposto.toLocaleString("pt-BR")}`;
    if (proposta.prazo) vars["prazo"] = `${proposta.prazo} meses`;
    if (proposta.condicoesEspeciais) vars["forma_pagamento"] = proposta.condicoesEspeciais;
    if (proposta.percentualPermuta) vars["descricao_permuta"] = `${proposta.percentualPermuta}% do valor total em unidades de permuta`;
  }

  const clausulasIniciais = gerarClausulasIniciais(vars);

  // Versão incremental por terreno
  const ultimaVersao = await prisma.contrato.findFirst({
    where: { terrenoId },
    orderBy: { versao: "desc" },
    select: { versao: true },
  });
  const novaVersao = (ultimaVersao?.versao ?? 0) + 1;

  const contrato = await prisma.$transaction(async (tx) => {
    const c = await tx.contrato.create({
      data: {
        terrenoId,
        propostaId: propostaId ?? null,
        versao: novaVersao,
        clausulas: clausulasIniciais as any,
        observacoes: observacoes ?? null,
        createdBy: dbUser.id,
      },
    });

    // Atualiza status do terreno
    const terrenoAtual = await tx.terreno.findUnique({
      where: { id: terrenoId },
      select: { status: true },
    });

    await tx.terreno.update({
      where: { id: terrenoId },
      data: { status: "CONTRATO_EM_ELABORACAO" },
    });

    await tx.terrenoStatusHistorico.create({
      data: {
        terrenoId,
        statusAnterior: terrenoAtual?.status ?? null,
        statusNovo: "CONTRATO_EM_ELABORACAO",
        observacao: `Contrato v${novaVersao} criado`,
        createdBy: dbUser.id,
      },
    });

    // Se criado a partir de proposta, marca como baseParaContrato
    if (propostaId) {
      await tx.proposta.update({
        where: { id: propostaId },
        data: { baseParaContrato: true },
      });
    }

    await tx.auditLog.create({
      data: {
        usuarioId: dbUser.id,
        terrenoId,
        tipo: "CREATE",
        entidade: "contrato",
        entidadeId: c.id,
        descricao: `Contrato v${novaVersao} criado${propostaId ? " a partir de proposta" : ""}`,
      },
    });

    return c;
  });

  return NextResponse.json(contrato, { status: 201 });
}
