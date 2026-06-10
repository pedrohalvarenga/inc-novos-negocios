import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { gerarClausulasIniciais } from "@/lib/contratos/template";

// Rota para seed de dados de desenvolvimento (apenas em ambiente não-produção)
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Não disponível em produção" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser || !["ADMIN", "GESTOR"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  // Busca terrenos existentes
  const terrenos = await prisma.terreno.findMany({
    where: { id: { in: ["t-001", "t-002", "t-003", "t-004", "t-006"] } },
    include: {
      proprietarios: { include: { proprietario: true }, where: { principal: true }, take: 1 },
    },
  });

  if (terrenos.length === 0) {
    return NextResponse.json({ error: "Execute o seed principal (npx prisma db seed) primeiro" }, { status: 422 });
  }

  const t001 = terrenos.find((t) => t.id === "t-001");
  const t002 = terrenos.find((t) => t.id === "t-002");
  const t003 = terrenos.find((t) => t.id === "t-003");
  const t004 = terrenos.find((t) => t.id === "t-004");
  const t006 = terrenos.find((t) => t.id === "t-006");

  const criado: string[] = [];

  // ── Propostas ──────────────────────────────────────────────────────────────

  if (t001) {
    // t-001: CONTRATO_EM_ELABORACAO → 2 propostas (v1 Recusada, v2 Aceita)
    await prisma.proposta.upsert({
      where: { id: "prop-t001-v1" },
      update: {},
      create: {
        id: "prop-t001-v1",
        terrenoId: "t-001",
        versao: 1,
        valorProposto: 8_500_000,
        formaPagamento: "PERMUTA_FISICA",
        prazo: 0,
        percentualPermuta: 100,
        condicoesEspeciais: "10 apartamentos de 65m² no empreendimento, entrega em 36 meses. Proposta inicial rejeitada — vendedor pediu mais unidades.",
        validade: new Date("2024-04-30"),
        status: "RECUSADA",
        motivoRecusa: "Quantidade de unidades insuficiente",
        dataEnvio: new Date("2024-04-01"),
        createdBy: dbUser.id,
      },
    });

    await prisma.proposta.upsert({
      where: { id: "prop-t001-v2" },
      update: {},
      create: {
        id: "prop-t001-v2",
        terrenoId: "t-001",
        versao: 2,
        valorProposto: 9_500_000,
        formaPagamento: "PERMUTA_FISICA",
        prazo: 0,
        percentualPermuta: 100,
        condicoesEspeciais: "12 apartamentos de 65m² no empreendimento, entrega em 36 meses. Proposta aceita após negociação.",
        validade: new Date("2024-05-31"),
        status: "ACEITA",
        baseParaContrato: true,
        dataEnvio: new Date("2024-04-20"),
        createdBy: dbUser.id,
      },
    });
    criado.push("proposta t-001 v1, v2");
  }

  if (t002) {
    // t-002: PROPOSTA_ACEITA → 1 proposta aceita
    await prisma.proposta.upsert({
      where: { id: "prop-t002-v1" },
      update: {},
      create: {
        id: "prop-t002-v1",
        terrenoId: "t-002",
        versao: 1,
        valorProposto: 21_000_000,
        formaPagamento: "MISTO",
        prazo: 24,
        percentualPermuta: 60,
        condicoesEspeciais: "20 apartamentos de 90m² + R$ 8,4M a prazo em 24 meses. Condição suspensiva: aprovação do projeto pela prefeitura do RJ.",
        validade: new Date("2025-01-31"),
        status: "ACEITA",
        baseParaContrato: false,
        dataEnvio: new Date("2024-06-10"),
        createdBy: dbUser.id,
      },
    });
    criado.push("proposta t-002 v1");
  }

  if (t003) {
    // t-003: EM_NEGOCIACAO → 1 proposta em negociação
    await prisma.proposta.upsert({
      where: { id: "prop-t003-v1" },
      update: {},
      create: {
        id: "prop-t003-v1",
        terrenoId: "t-003",
        versao: 1,
        valorProposto: 4_800_000,
        formaPagamento: "PERMUTA_FINANCEIRA",
        prazo: 36,
        percentualPermuta: 80,
        condicoesEspeciais: "Permuta financeira: 80% do valor em crédito de unidades; 20% em dinheiro a prazo de 36 meses após a assinatura do contrato.",
        validade: new Date("2025-03-31"),
        status: "EM_NEGOCIACAO",
        dataEnvio: new Date("2025-01-15"),
        createdBy: dbUser.id,
      },
    });
    criado.push("proposta t-003 v1");
  }

  if (t004) {
    // t-004: PROPOSTA_ENVIADA → 1 proposta enviada
    await prisma.proposta.upsert({
      where: { id: "prop-t004-v1" },
      update: {},
      create: {
        id: "prop-t004-v1",
        terrenoId: "t-004",
        versao: 1,
        valorProposto: 6_300_000,
        formaPagamento: "DINHEIRO_PRAZO",
        prazo: 48,
        condicoesEspeciais: "Pagamento em 48 parcelas mensais corrigidas pelo IPCA. Condição: aprovação de projeto para 160 unidades.",
        validade: new Date(Date.now() + 10 * 24 * 3600000), // expira em 10 dias (alerta de expiração)
        status: "ENVIADA",
        dataEnvio: new Date("2025-04-20"),
        createdBy: dbUser.id,
      },
    });
    criado.push("proposta t-004 v1");
  }

  // Proposta rascunho
  await prisma.proposta.upsert({
    where: { id: "prop-rascunho-01" },
    update: {},
    create: {
      id: "prop-rascunho-01",
      terrenoId: terrenos[0].id,
      versao: (await prisma.proposta.count({ where: { terrenoId: terrenos[0].id } })) + 1,
      valorProposto: null,
      formaPagamento: "PERMUTA_FISICA",
      condicoesEspeciais: "Proposta em elaboração — aguardando definição de valores com o board.",
      status: "RASCUNHO",
      createdBy: dbUser.id,
    },
  });
  criado.push("proposta rascunho");

  // ── Contratos ──────────────────────────────────────────────────────────────

  if (t001) {
    const prop = await prisma.proposta.findUnique({ where: { id: "prop-t001-v2" } });
    const proprietario = t001.proprietarios[0]?.proprietario;
    const vars: Record<string, string> = {
      "vendedor.nome": proprietario?.nomeRazaoSocial ?? "José Carlos Mendonça",
      "vendedor.cpf_cnpj": proprietario?.cpfCnpj ?? "123.456.789-00",
      "terreno.endereco": "Avenida Paulista, 1500, Bela Vista, São Paulo/SP",
      "terreno.area": "1.200",
      "terreno.cidade": "São Paulo",
      "terreno.uf": "SP",
      "valor": "R$ 9.500.000",
      "valor_extenso": "nove milhões e quinhentos mil reais",
      "forma_pagamento": "Permuta física: 12 (doze) apartamentos de 65m² no empreendimento a ser construído no imóvel, a serem entregues no prazo de 36 (trinta e seis) meses após o início das obras.",
      "descricao_permuta": "12 apartamentos de 65m², tipologia 2 dormitórios, padrão médio, localizados em andares intermediários do empreendimento.",
    };

    await prisma.contrato.upsert({
      where: { id: "contrato-t001-v1" },
      update: {},
      create: {
        id: "contrato-t001-v1",
        terrenoId: "t-001",
        propostaId: prop?.id ?? null,
        versao: 1,
        clausulas: gerarClausulasIniciais(vars) as any,
        status: "EM_REVISAO",
        observacoes: "Contrato em revisão pelo jurídico. Aguardar parecer sobre cláusula de condições suspensivas.",
        createdBy: dbUser.id,
      },
    });
    criado.push("contrato t-001 v1");
  }

  if (t006) {
    const vars: Record<string, string> = {
      "vendedor.nome": "Paulo e Maria Silva",
      "vendedor.cpf_cnpj": "987.654.321-00",
      "terreno.endereco": "Rua XV de Novembro, 300, Centro, Porto Alegre/RS",
      "terreno.area": "600",
      "terreno.cidade": "Porto Alegre",
      "terreno.uf": "RS",
      "valor": "R$ 3.200.000",
      "valor_extenso": "três milhões e duzentos mil reais",
      "forma_pagamento": "Pagamento à vista em única parcela no ato da lavratura da escritura pública.",
    };

    await prisma.contrato.upsert({
      where: { id: "contrato-t006-v1" },
      update: {},
      create: {
        id: "contrato-t006-v1",
        terrenoId: "t-006",
        versao: 1,
        clausulas: gerarClausulasIniciais(vars) as any,
        status: "ASSINADO",
        dataAssinatura: new Date("2024-02-15"),
        observacoes: "Contrato assinado. Escritura lavrada em cartório.",
        createdBy: dbUser.id,
      },
    });

    // Gera lançamento financeiro para o contrato assinado
    await prisma.lancamentoFinanceiro.upsert({
      where: { id: "lanc-t006-01" },
      update: {},
      create: {
        id: "lanc-t006-01",
        terrenoId: "t-006",
        contratoId: "contrato-t006-v1",
        tipo: "PARCELA_TERRENISTA",
        descricao: "Pagamento integral ao terrenista",
        valor: 3_200_000,
        vencimento: new Date("2024-03-15"),
        status: "PAGO",
        createdBy: dbUser.id,
      },
    });

    criado.push("contrato t-006 v1 + lançamento financeiro");
  }

  return NextResponse.json({
    ok: true,
    mensagem: `Seed de propostas e contratos executado com sucesso`,
    criado,
  });
}
