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

  // ─── Fase 3: Matrículas fictícias ────────────────────────────────────────────
  // Usar o primeiro terreno disponível no banco para as matrículas seed
  const primeiroTerreno = await prisma.terreno.findFirst({ orderBy: { createdAt: "asc" } });
  const segundoTerreno = await prisma.terreno.findFirst({ orderBy: { createdAt: "asc" }, skip: 1 });

  if (primeiroTerreno) {
    await prisma.matricula.upsert({
      where: { id: "mat-001" },
      update: {},
      create: {
        id: "mat-001",
        terrenoId: primeiroTerreno.id,
        numero: "45.678",
        cartorio: "2º Cartório de Registro de Imóveis",
        comarca: "São Paulo – SP",
        riscoOnus: "ALTO",
        dadosExtraidos: {
          numero: "45.678",
          cartorioComarca: "2º Cartório de Registro de Imóveis — São Paulo – SP",
          descricaoImovel: "Terreno urbano com área de 1.250 m², situado na Rua das Acácias, 123, Bairro Jardim América, São Paulo/SP.",
          areaRegistrada: 1250,
          proprietariosAtuais: [{ nome: "José Carlos Mendonça", cpfCnpj: "123.456.789-00" }],
          cadeiaDominial: [
            { data: "15/03/2008", descricao: "Aquisição por José Carlos Mendonça via compra e venda" },
            { data: "22/07/1992", descricao: "Transmissão por inventário — espólio de Antônio Mendonça" },
          ],
          registrosAverbacoes: ["Averbação de construção de galpão – 2012", "Atualização de área por retificação – 2015"],
          onus: [
            {
              tipo: "Hipoteca",
              descricao: "Hipoteca convencional em favor do Banco Bradesco S.A. no valor de R$ 850.000,00 — R4 de 12/05/2019",
              risco: "ALTO",
              livroFolha: "R-4/45.678",
            },
          ],
          riscoConsolidado: "ALTO",
          observacoes: "Hipoteca ainda vigente conforme matrícula. Necessária baixa ou anuência do credor para transferência.",
        },
        onus: [
          {
            tipo: "Hipoteca",
            descricao: "Hipoteca convencional em favor do Banco Bradesco S.A. no valor de R$ 850.000,00 — R4 de 12/05/2019",
            risco: "ALTO",
            livroFolha: "R-4/45.678",
          },
        ],
        arquivos: [{ nome: "matricula-p1.jpg", tipo: "image/jpeg", tamanho: 0 }],
        createdBy: admin.id,
      },
    });
  }

  if (segundoTerreno) {
    await prisma.matricula.upsert({
      where: { id: "mat-002" },
      update: {},
      create: {
        id: "mat-002",
        terrenoId: segundoTerreno.id,
        numero: "12.345",
        cartorio: "1º Cartório de Registro de Imóveis",
        comarca: "Campinas – SP",
        riscoOnus: "BAIXO",
        dadosExtraidos: {
          numero: "12.345",
          cartorioComarca: "1º Cartório de Registro de Imóveis — Campinas – SP",
          descricaoImovel: "Terreno urbano com área de 2.100 m², situado na Av. Presidente Kennedy, 456, Bairro Jardim Guanabara, Campinas/SP.",
          areaRegistrada: 2100,
          proprietariosAtuais: [
            { nome: "Paulo Silva", cpfCnpj: "987.654.321-00" },
            { nome: "Maria Silva", cpfCnpj: "111.222.333-44" },
          ],
          cadeiaDominial: [
            { data: "10/06/2014", descricao: "Aquisição por Paulo e Maria Silva via compra e venda" },
          ],
          registrosAverbacoes: ["Comunicação de venda – 2014", "Averbação de casamento – 2014"],
          onus: [],
          riscoConsolidado: "BAIXO",
          observacoes: null,
        },
        onus: [],
        arquivos: [{ nome: "matricula-p1.jpg", tipo: "image/jpeg", tamanho: 0 }, { nome: "matricula-p2.jpg", tipo: "image/jpeg", tamanho: 0 }],
        createdBy: admin.id,
      },
    });
  }

  // ─── Fase 3: Due Diligences fictícias ────────────────────────────────────────
  const primeiroProprietario = await prisma.proprietario.findFirst({ orderBy: { createdAt: "asc" } });
  const segundoProprietario = await prisma.proprietario.findFirst({ orderBy: { createdAt: "asc" }, skip: 1 });
  const terceiroProprietario = await prisma.proprietario.findFirst({ orderBy: { createdAt: "asc" }, skip: 2 });

  if (primeiroProprietario && primeiroTerreno) {
    await prisma.dueDiligence.upsert({
      where: { id: "dd-001" },
      update: {},
      create: {
        id: "dd-001",
        proprietarioId: primeiroProprietario.id,
        terrenoId: primeiroTerreno.id,
        tipo: "CPF",
        fonte: "Manual",
        score: 72,
        resumo: "Vendedor sem restrições graves identificadas. Apresenta alguns processos trabalhistas antigos já encerrados. Recomenda-se certidão negativa municipal atualizada.",
        checklist: [
          { item: "Situação cadastral CPF", status: "OK", data: "2026-06-01", fonte: "Receita Federal", evidencia: "Situação regular" },
          { item: "Processos cíveis", status: "ALERTA", data: "2026-06-01", evidencia: "1 processo antigo em fase de execução" },
          { item: "Execuções fiscais", status: "OK", data: "2026-06-01" },
          { item: "Reclamações trabalhistas", status: "OK", data: "2026-06-01", evidencia: "Processo de 2019 já encerrado" },
          { item: "Protestos em cartório", status: "OK", data: "2026-06-01" },
          { item: "Falência / recuperação judicial", status: "OK", data: "2026-06-01" },
          { item: "Certidão negativa federal", status: "OK", data: "2026-06-01" },
          { item: "Certidão negativa estadual", status: "OK", data: "2026-06-01" },
          { item: "Certidão negativa municipal", status: "PENDENTE" },
          { item: "Certidão negativa trabalhista", status: "OK", data: "2026-06-01" },
        ],
        resultado: {
          parecer: {
            score: 72,
            resumoRiscos: "Vendedor com situação cadastral regular. Há um processo cível em andamento que pode representar risco de fraude contra credores. Recomenda-se atenção às certidões municipais.",
            alertaFraude: false,
            recomendacoes: [
              "Solicitar certidão negativa municipal atualizada",
              "Incluir cláusula de retenção de 10% do valor até baixa do processo cível",
              "Verificar se o processo cível envolve o imóvel objeto da negociação",
            ],
            podeProsseguir: "COM_RESSALVAS",
            justificativaProsseguir: "Pode prosseguir com as ressalvas de obtenção das certidões pendentes e cláusula de retenção.",
          },
        },
        dataAnalise: new Date("2026-06-01"),
        createdBy: admin.id,
      },
    });
  }

  if (segundoProprietario && segundoTerreno) {
    await prisma.dueDiligence.upsert({
      where: { id: "dd-002" },
      update: {},
      create: {
        id: "dd-002",
        proprietarioId: segundoProprietario.id,
        terrenoId: segundoTerreno.id,
        tipo: "CNPJ",
        fonte: "Receita Federal (BrasilAPI)",
        score: 45,
        resumo: "Empresa com situação irregular na Receita Federal e recuperação judicial em andamento. Alto risco para a INC.",
        checklist: [
          { item: "Situação cadastral CNPJ", status: "CRITICO", data: "2026-06-01", evidencia: "INAPTA na Receita Federal" },
          { item: "Processos cíveis", status: "CRITICO", data: "2026-06-01", evidencia: "Múltiplos processos de execução" },
          { item: "Execuções fiscais", status: "ALERTA", data: "2026-06-01", evidencia: "2 CDATs em aberto" },
          { item: "Reclamações trabalhistas", status: "ALERTA", data: "2026-06-01" },
          { item: "Protestos em cartório", status: "ALERTA", data: "2026-06-01", evidencia: "3 protestos identificados" },
          { item: "Falência / recuperação judicial / dissolução", status: "CRITICO", data: "2026-06-01", evidencia: "Recuperação judicial decretada em 2025" },
          { item: "Certidão negativa federal", status: "PENDENTE" },
          { item: "Certidão negativa estadual", status: "PENDENTE" },
          { item: "Certidão negativa municipal", status: "PENDENTE" },
          { item: "Certidão negativa trabalhista", status: "PENDENTE" },
          { item: "Quadro societário atualizado", status: "OK", data: "2026-06-01" },
        ],
        resultado: {
          parecer: {
            score: 45,
            resumoRiscos: "Empresa em situação crítica: INAPTA na Receita Federal, com recuperação judicial decretada e múltiplos processos de execução. Venda do imóvel em recuperação judicial pode caracterizar fraude contra credores.",
            alertaFraude: true,
            motivoAlertaFraude: "Empresa em recuperação judicial vendendo ativo imóvel sem autorização judicial expressa pode caracterizar fraude à execução.",
            recomendacoes: [
              "Exigir autorização judicial do juiz da recuperação para alienação do imóvel",
              "Contratar advogado especialista em recuperação judicial para acompanhar a operação",
              "Verificar se o imóvel faz parte da massa de ativos da recuperação",
              "Não assinar contrato sem anuência formal dos credores ou do administrador judicial",
            ],
            podeProsseguir: "NAO",
            justificativaProsseguir: "Não recomendado prosseguir sem autorização judicial e anuência dos credores da recuperação.",
          },
        },
        dataAnalise: new Date("2026-06-01"),
        createdBy: gestor.id,
      },
    });
  }

  if (terceiroProprietario) {
    await prisma.dueDiligence.upsert({
      where: { id: "dd-003" },
      update: {},
      create: {
        id: "dd-003",
        proprietarioId: terceiroProprietario.id,
        tipo: "CPF",
        fonte: "Manual",
        checklist: [
          { item: "Situação cadastral CPF", status: "PENDENTE" },
          { item: "Processos cíveis", status: "PENDENTE" },
          { item: "Execuções fiscais", status: "PENDENTE" },
          { item: "Reclamações trabalhistas", status: "PENDENTE" },
          { item: "Protestos em cartório", status: "PENDENTE" },
          { item: "Falência / recuperação judicial", status: "PENDENTE" },
          { item: "Certidão negativa federal", status: "PENDENTE" },
          { item: "Certidão negativa estadual", status: "PENDENTE" },
          { item: "Certidão negativa municipal", status: "PENDENTE" },
          { item: "Certidão negativa trabalhista", status: "PENDENTE" },
        ],
        createdBy: analista.id,
      },
    });
  }

  // ─── Fase 4: Lançamentos financeiros ─────────────────────────────────────────
  const hoje = new Date("2026-06-10");
  function daysAgo(n: number) { const d = new Date(hoje); d.setDate(d.getDate() - n); return d; }
  function daysAhead(n: number) { const d = new Date(hoje); d.setDate(d.getDate() + n); return d; }

  const lancamentosData = [
    // t-001: Paulista — contrato em elaboração
    { id: "lanc-001", terrenoId: "t-001", tipo: "PARCELA_TERRENISTA", descricao: "Sinal de negociação", valor: 500_000, vencimento: daysAgo(60), status: "PAGO", dataPagamento: daysAgo(58) },
    { id: "lanc-002", terrenoId: "t-001", tipo: "IPTU", descricao: "IPTU 2026 — parcela 1/3", valor: 18_500, vencimento: daysAgo(15), status: "PAGO", dataPagamento: daysAgo(14) },
    { id: "lanc-003", terrenoId: "t-001", tipo: "IPTU", descricao: "IPTU 2026 — parcela 2/3", valor: 18_500, vencimento: daysAhead(15), status: "A_PAGAR", recorrente: false },
    { id: "lanc-004", terrenoId: "t-001", tipo: "IPTU", descricao: "IPTU 2026 — parcela 3/3", valor: 18_500, vencimento: daysAhead(45), status: "PREVISTO" },
    { id: "lanc-005", terrenoId: "t-001", tipo: "MANUTENCAO", descricao: "Segurança do terreno — maio", valor: 3_200, vencimento: daysAgo(10), status: "ATRASADO" },
    { id: "lanc-006", terrenoId: "t-001", tipo: "MANUTENCAO", descricao: "Segurança do terreno — junho", valor: 3_200, vencimento: daysAhead(20), status: "PREVISTO", recorrente: true, recorrencia: "MENSAL" },
    // t-002: Barra — proposta aceita
    { id: "lanc-007", terrenoId: "t-002", tipo: "CARTORIO", descricao: "Análise documental cartório", valor: 8_400, vencimento: daysAgo(45), status: "PAGO", dataPagamento: daysAgo(44) },
    { id: "lanc-008", terrenoId: "t-002", tipo: "IPTU", descricao: "IPTU 2026", valor: 42_000, vencimento: daysAgo(5), status: "ATRASADO" },
    { id: "lanc-009", terrenoId: "t-002", tipo: "COMISSAO", descricao: "Comissão corretor Bruno Teixeira (2%)", valor: 420_000, vencimento: daysAhead(30), status: "PREVISTO" },
    { id: "lanc-010", terrenoId: "t-002", tipo: "CERCA", descricao: "Instalação cercamento perimetral", valor: 35_000, vencimento: daysAhead(7), status: "A_PAGAR" },
    // t-003: Savassi
    { id: "lanc-011", terrenoId: "t-003", tipo: "IPTU", descricao: "IPTU 2026", valor: 12_800, vencimento: daysAhead(2), status: "A_PAGAR" },
    { id: "lanc-012", terrenoId: "t-003", tipo: "MANUTENCAO", descricao: "Limpeza terreno — mensal", valor: 1_500, vencimento: daysAgo(20), status: "PAGO", dataPagamento: daysAgo(19), recorrente: true, recorrencia: "MENSAL" },
    // t-006: Porto Alegre — contrato assinado → tem lançamentos gerados pelo gatilho da Fase 2
    { id: "lanc-013", terrenoId: "t-006", tipo: "PARCELA_TERRENISTA", descricao: "Parcela 1/12 — contrato assinado", valor: 266_666, vencimento: daysAgo(30), status: "PAGO", dataPagamento: daysAgo(29) },
    { id: "lanc-014", terrenoId: "t-006", tipo: "PARCELA_TERRENISTA", descricao: "Parcela 2/12 — contrato assinado", valor: 266_666, vencimento: daysAhead(0), status: "A_PAGAR" },
    { id: "lanc-015", terrenoId: "t-006", tipo: "PARCELA_TERRENISTA", descricao: "Parcela 3/12 — contrato assinado", valor: 266_666, vencimento: daysAhead(30), status: "PREVISTO", recorrente: true, recorrencia: "MENSAL" },
    { id: "lanc-016", terrenoId: "t-006", tipo: "IPTU", descricao: "IPTU 2026 parcelado 1/2", valor: 9_600, vencimento: daysAgo(25), status: "ATRASADO" },
    { id: "lanc-017", terrenoId: "t-006", tipo: "CARTORIO", descricao: "Registro de contrato", valor: 6_200, vencimento: daysAhead(10), status: "A_PAGAR" },
    { id: "lanc-018", terrenoId: "t-001", tipo: "OUTROS", descricao: "Avaliação de engenharia", valor: 5_000, vencimento: daysAhead(60), status: "PREVISTO" },
  ];

  for (const l of lancamentosData) {
    const { id, dataPagamento, ...rest } = l as any;
    await prisma.lancamentoFinanceiro.upsert({
      where: { id },
      update: {},
      create: {
        id,
        ...rest,
        dataPagamento: dataPagamento ? new Date(dataPagamento) : undefined,
        vencimento: rest.vencimento ? new Date(rest.vencimento) : undefined,
        createdBy: admin.id,
      },
    });
  }

  console.log("✅ Seed concluído! 12 terrenos, 5 proprietários, 2 corretores + Fase 3: 2 matrículas, 3 due diligences + Fase 4: 18 lançamentos financeiros criados.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
