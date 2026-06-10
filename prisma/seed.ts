import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Cria usuário admin (deve ter sido criado no Supabase Auth primeiro)
  // Este seed cria apenas registros no banco relacional
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@inc.com.br" },
    update: {},
    create: {
      supabaseId: "00000000-0000-0000-0000-000000000001",
      nome: "Lucas Costa",
      email: "admin@inc.com.br",
      role: "ADMIN",
    },
  });

  const gestor = await prisma.usuario.upsert({
    where: { email: "gestor@inc.com.br" },
    update: {},
    create: {
      supabaseId: "00000000-0000-0000-0000-000000000002",
      nome: "Mariana Ferreira",
      email: "gestor@inc.com.br",
      role: "GESTOR",
    },
  });

  const analista = await prisma.usuario.upsert({
    where: { email: "analista@inc.com.br" },
    update: {},
    create: {
      supabaseId: "00000000-0000-0000-0000-000000000003",
      nome: "Rafael Santos",
      email: "analista@inc.com.br",
      role: "ANALISTA",
    },
  });

  // Proprietários
  const props = await Promise.all([
    prisma.proprietario.upsert({
      where: { id: "prop-001" },
      update: {},
      create: {
        id: "prop-001",
        nomeRazaoSocial: "José Carlos Mendonça",
        cpfCnpj: "123.456.789-00",
        telefone: "(11) 99887-6655",
        email: "jcmendonca@gmail.com",
        createdBy: admin.id,
      },
    }),
    prisma.proprietario.upsert({
      where: { id: "prop-002" },
      update: {},
      create: {
        id: "prop-002",
        nomeRazaoSocial: "Família Rodrigues Ltda.",
        cpfCnpj: "12.345.678/0001-99",
        telefone: "(21) 98765-4321",
        email: "rodrigues@familiarodr.com.br",
        representanteLegal: "Ana Rodrigues",
        createdBy: admin.id,
      },
    }),
    prisma.proprietario.upsert({
      where: { id: "prop-003" },
      update: {},
      create: {
        id: "prop-003",
        nomeRazaoSocial: "Paulo e Maria Silva",
        cpfCnpj: "987.654.321-00",
        telefone: "(31) 97654-3210",
        createdBy: admin.id,
      },
    }),
    prisma.proprietario.upsert({
      where: { id: "prop-004" },
      update: {},
      create: {
        id: "prop-004",
        nomeRazaoSocial: "Construtora Horizonte S.A.",
        cpfCnpj: "98.765.432/0001-10",
        telefone: "(41) 3333-4444",
        email: "negocios@horizonte.com.br",
        representanteLegal: "Dir. Claudio Horizonte",
        createdBy: admin.id,
      },
    }),
    prisma.proprietario.upsert({
      where: { id: "prop-005" },
      update: {},
      create: {
        id: "prop-005",
        nomeRazaoSocial: "Herdeiros Tavares",
        cpfCnpj: "111.222.333-44",
        telefone: "(11) 91234-5678",
        createdBy: admin.id,
      },
    }),
  ]);

  // Corretores
  const corretores = await Promise.all([
    prisma.corretor.upsert({
      where: { id: "cor-001" },
      update: {},
      create: {
        id: "cor-001",
        nome: "Andréa Lima",
        telefone: "(11) 98888-1111",
        email: "andrea.lima@corretoraspl.com.br",
        creci: "123456-F",
        percentualComissao: 1.5,
        createdBy: admin.id,
      },
    }),
    prisma.corretor.upsert({
      where: { id: "cor-002" },
      update: {},
      create: {
        id: "cor-002",
        nome: "Bruno Teixeira",
        telefone: "(21) 97777-2222",
        email: "bteixeira@imoveisrj.com.br",
        creci: "654321-F",
        percentualComissao: 2.0,
        createdBy: admin.id,
      },
    }),
  ]);

  // Terrenos
  const terrenosData = [
    {
      id: "t-001",
      nome: "Terreno Av. Paulista",
      apelido: "Paulista Center",
      logradouro: "Avenida Paulista",
      numero: "1500",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
      cep: "01310-100",
      areaTerreno: 1200,
      zoneamento: "ZM-3b",
      coeficienteAproveitamento: 4.0,
      numUnidadesEstimado: 120,
      areaPrivativaMedia: 65,
      vgvEstimado: 78_000_000,
      valorPedido: 12_000_000,
      valorCompra: 9_500_000,
      formaPagamento: "PERMUTA_FISICA" as const,
      prazoPagamento: 0,
      percentualPermuta: 100,
      descricaoPermuta: "12 apartamentos de 65m² no empreendimento",
      status: "CONTRATO_EM_ELABORACAO" as const,
      createdBy: admin.id,
      responsavelId: gestor.id,
      corretorId: corretores[0].id,
      dataProspeccao: new Date("2024-03-15"),
    },
    {
      id: "t-002",
      nome: "Gleba Barra da Tijuca",
      apelido: "Barra Premium",
      logradouro: "Avenida das Américas",
      numero: "4500",
      bairro: "Barra da Tijuca",
      cidade: "Rio de Janeiro",
      uf: "RJ",
      areaTerreno: 8500,
      zoneamento: "ATE",
      coeficienteAproveitamento: 2.5,
      numUnidadesEstimado: 200,
      areaPrivativaMedia: 90,
      vgvEstimado: 180_000_000,
      valorPedido: 25_000_000,
      valorCompra: 21_000_000,
      formaPagamento: "MISTO" as const,
      prazoPagamento: 24,
      percentualPermuta: 60,
      descricaoPermuta: "20 apartamentos de 90m² + R$ 8,4M a prazo em 24 meses",
      status: "PROPOSTA_ACEITA" as const,
      createdBy: admin.id,
      responsavelId: gestor.id,
      corretorId: corretores[1].id,
      dataProspeccao: new Date("2024-05-20"),
    },
    {
      id: "t-003",
      nome: "Lote Savassi",
      logradouro: "Rua Antônio de Albuquerque",
      numero: "700",
      bairro: "Savassi",
      cidade: "Belo Horizonte",
      uf: "MG",
      areaTerreno: 950,
      zoneamento: "ZAP-1",
      coeficienteAproveitamento: 3.5,
      numUnidadesEstimado: 80,
      areaPrivativaMedia: 70,
      vgvEstimado: 44_800_000,
      valorPedido: 5_500_000,
      valorCompra: 4_800_000,
      formaPagamento: "PERMUTA_FINANCEIRA" as const,
      prazoPagamento: 36,
      percentualPermuta: 80,
      status: "EM_NEGOCIACAO" as const,
      createdBy: analista.id,
      responsavelId: analista.id,
      dataProspeccao: new Date("2024-08-10"),
    },
    {
      id: "t-004",
      nome: "Área Água Verde",
      logradouro: "Rua Mato Grosso",
      numero: "1200",
      bairro: "Água Verde",
      cidade: "Curitiba",
      uf: "PR",
      areaTerreno: 2200,
      zoneamento: "ZR-4",
      coeficienteAproveitamento: 3.0,
      numUnidadesEstimado: 160,
      areaPrivativaMedia: 55,
      vgvEstimado: 57_600_000,
      valorPedido: 7_200_000,
      valorCompra: 6_300_000,
      formaPagamento: "DINHEIRO_PRAZO" as const,
      prazoPagamento: 48,
      status: "PROPOSTA_ENVIADA" as const,
      createdBy: analista.id,
      responsavelId: analista.id,
      corretorId: corretores[0].id,
      dataProspeccao: new Date("2024-09-03"),
    },
    {
      id: "t-005",
      nome: "Gleba Alphaville",
      apelido: "Alpha Sul",
      logradouro: "Alameda Rio Negro",
      numero: "500",
      bairro: "Alphaville Industrial",
      cidade: "Barueri",
      uf: "SP",
      areaTerreno: 5000,
      zoneamento: "ZR-2",
      coeficienteAproveitamento: 2.0,
      numUnidadesEstimado: 240,
      areaPrivativaMedia: 45,
      vgvEstimado: 86_400_000,
      valorPedido: 11_000_000,
      status: "EM_NEGOCIACAO" as const,
      createdBy: admin.id,
      responsavelId: gestor.id,
      dataProspeccao: new Date("2024-10-15"),
    },
    {
      id: "t-006",
      nome: "Terreno Centro Histórico",
      logradouro: "Rua XV de Novembro",
      numero: "300",
      bairro: "Centro",
      cidade: "Porto Alegre",
      uf: "RS",
      areaTerreno: 600,
      zoneamento: "AEIS-1",
      numUnidadesEstimado: 60,
      areaPrivativaMedia: 50,
      vgvEstimado: 19_200_000,
      valorPedido: 3_800_000,
      valorCompra: 3_200_000,
      formaPagamento: "DINHEIRO_VISTA" as const,
      status: "CONTRATO_ASSINADO" as const,
      createdBy: admin.id,
      responsavelId: gestor.id,
      dataProspeccao: new Date("2023-11-10"),
    },
    {
      id: "t-007",
      nome: "Lote Meireles",
      logradouro: "Avenida Beira Mar",
      numero: "2000",
      bairro: "Meireles",
      cidade: "Fortaleza",
      uf: "CE",
      areaTerreno: 1800,
      zoneamento: "ZOR",
      coeficienteAproveitamento: 3.5,
      numUnidadesEstimado: 150,
      areaPrivativaMedia: 75,
      vgvEstimado: 90_000_000,
      valorPedido: 13_500_000,
      status: "PROSPECCAO" as const,
      createdBy: analista.id,
      dataProspeccao: new Date("2025-01-08"),
    },
    {
      id: "t-008",
      nome: "Área Ponta Negra",
      logradouro: "Via Costeira",
      numero: "s/n",
      bairro: "Ponta Negra",
      cidade: "Natal",
      uf: "RN",
      areaTerreno: 12000,
      coeficienteAproveitamento: 2.0,
      numUnidadesEstimado: 320,
      areaPrivativaMedia: 60,
      vgvEstimado: 115_200_000,
      valorPedido: 20_000_000,
      status: "PROSPECCAO" as const,
      createdBy: analista.id,
      dataProspeccao: new Date("2025-02-14"),
    },
    {
      id: "t-009",
      nome: "Gleba Jardins",
      logradouro: "Rua Oscar Freire",
      numero: "800",
      bairro: "Jardins",
      cidade: "São Paulo",
      uf: "SP",
      areaTerreno: 800,
      zoneamento: "ZM-4",
      coeficienteAproveitamento: 4.0,
      numUnidadesEstimado: 64,
      areaPrivativaMedia: 120,
      vgvEstimado: 76_800_000,
      valorPedido: 18_000_000,
      valorCompra: 15_200_000,
      formaPagamento: "PERMUTA_FISICA" as const,
      percentualPermuta: 100,
      descricaoPermuta: "8 coberturas de 240m² no empreendimento",
      status: "EM_NEGOCIACAO" as const,
      createdBy: admin.id,
      responsavelId: gestor.id,
      dataProspeccao: new Date("2025-03-01"),
    },
    {
      id: "t-010",
      nome: "Terreno Moema",
      logradouro: "Alameda dos Nhambiquaras",
      numero: "100",
      bairro: "Moema",
      cidade: "São Paulo",
      uf: "SP",
      areaTerreno: 700,
      zoneamento: "ZM-3a",
      numUnidadesEstimado: 72,
      areaPrivativaMedia: 80,
      vgvEstimado: 57_600_000,
      valorPedido: 10_000_000,
      status: "DESCARTADO" as const,
      createdBy: analista.id,
      dataProspeccao: new Date("2024-06-15"),
    },
    {
      id: "t-011",
      nome: "Área Santo André",
      logradouro: "Avenida Industrial",
      numero: "4000",
      bairro: "Centro",
      cidade: "Santo André",
      uf: "SP",
      areaTerreno: 3500,
      numUnidadesEstimado: 280,
      areaPrivativaMedia: 50,
      vgvEstimado: 84_000_000,
      valorPedido: 9_500_000,
      valorCompra: 8_200_000,
      formaPagamento: "DINHEIRO_PRAZO" as const,
      prazoPagamento: 60,
      status: "PROPOSTA_ENVIADA" as const,
      createdBy: analista.id,
      responsavelId: analista.id,
      dataProspeccao: new Date("2025-04-10"),
    },
    {
      id: "t-012",
      nome: "Lote Florianópolis Centro",
      logradouro: "Rua Felipe Schmidt",
      numero: "200",
      bairro: "Centro",
      cidade: "Florianópolis",
      uf: "SC",
      areaTerreno: 450,
      zoneamento: "ACI",
      numUnidadesEstimado: 40,
      areaPrivativaMedia: 85,
      vgvEstimado: 34_000_000,
      valorPedido: 4_200_000,
      valorCompra: 3_700_000,
      formaPagamento: "PERMUTA_FINANCEIRA" as const,
      prazoPagamento: 30,
      percentualPermuta: 70,
      status: "EM_NEGOCIACAO" as const,
      createdBy: admin.id,
      dataProspeccao: new Date("2025-05-05"),
    },
  ];

  for (const dados of terrenosData) {
    const { id, dataProspeccao, ...rest } = dados;
    const terreno = await prisma.terreno.upsert({
      where: { id },
      update: {},
      create: { id, ...rest, dataProspeccao: dataProspeccao ?? new Date() },
    });

    // Cria histórico de status se não existir
    const histCount = await prisma.terrenoStatusHistorico.count({ where: { terrenoId: terreno.id } });
    if (histCount === 0) {
      // Simula histórico
      const trajetoria: { status: typeof terreno.status; dias: number }[] = [];
      const funilOrder = ["PROSPECCAO", "EM_NEGOCIACAO", "PROPOSTA_ENVIADA", "PROPOSTA_ACEITA", "CONTRATO_EM_ELABORACAO", "CONTRATO_ASSINADO"];
      const idx = funilOrder.indexOf(terreno.status as string);

      for (let i = 0; i <= Math.max(idx, 0); i++) {
        trajetoria.push({ status: funilOrder[i] as any, dias: 15 + Math.floor(Math.random() * 30) });
      }
      if (terreno.status === "DESCARTADO") {
        trajetoria.push({ status: "DESCARTADO" as any, dias: 0 });
      }

      let dataAtual = dataProspeccao ?? new Date("2024-01-01");
      for (let i = 0; i < trajetoria.length; i++) {
        await prisma.terrenoStatusHistorico.create({
          data: {
            terrenoId: terreno.id,
            statusAnterior: i > 0 ? trajetoria[i - 1].status : null,
            statusNovo: trajetoria[i].status,
            createdAt: dataAtual,
            createdBy: terreno.createdBy,
          },
        });
        dataAtual = new Date(dataAtual.getTime() + trajetoria[i].dias * 86400000);
      }
    }
  }

  // Vincula proprietários aos terrenos
  const vinculos = [
    { terrenoId: "t-001", proprietarioId: props[0].id, principal: true, percentual: 100 },
    { terrenoId: "t-002", proprietarioId: props[1].id, principal: true, percentual: 100 },
    { terrenoId: "t-003", proprietarioId: props[2].id, principal: true, percentual: 100 },
    { terrenoId: "t-004", proprietarioId: props[3].id, principal: true, percentual: 100 },
    { terrenoId: "t-005", proprietarioId: props[4].id, principal: true, percentual: 70 },
    { terrenoId: "t-005", proprietarioId: props[0].id, principal: false, percentual: 30 },
    { terrenoId: "t-006", proprietarioId: props[2].id, principal: true, percentual: 100 },
    { terrenoId: "t-009", proprietarioId: props[0].id, principal: true, percentual: 100 },
    { terrenoId: "t-012", proprietarioId: props[3].id, principal: true, percentual: 100 },
  ];

  for (const v of vinculos) {
    await prisma.terrenoProprietario.upsert({
      where: {
        terrenoId_proprietarioId: { terrenoId: v.terrenoId, proprietarioId: v.proprietarioId },
      },
      update: {},
      create: v,
    });
  }

  // Configurações padrão
  await prisma.configuracao.upsert({
    where: { chave: "score_pesos" },
    update: {},
    create: {
      chave: "score_pesos",
      valor: { pesoVgv: 40, pesoPagamento: 25, pesoPrazo: 20, pesoRisco: 15 },
    },
  });

  await prisma.configuracao.upsert({
    where: { chave: "faixas_vgv" },
    update: {},
    create: {
      chave: "faixas_vgv",
      valor: { faixaVerde: 10, faixaAmarela: 15 },
    },
  });

  await prisma.configuracao.upsert({
    where: { chave: "marca" },
    update: {},
    create: {
      chave: "marca",
      valor: { incOrange: "#F26522" },
    },
  });

  console.log("✅ Seed concluído! 12 terrenos, 5 proprietários, 2 corretores criados.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
