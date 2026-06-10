◇ injected env (4) from .env // tip: ◈ secrets for agents [www.dotenvx.com]
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GESTOR', 'ANALISTA', 'LEITURA');

-- CreateEnum
CREATE TYPE "OrigemTerreno" AS ENUM ('ZENKIT', 'MANUAL');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PERMUTA_FISICA', 'PERMUTA_FINANCEIRA', 'DINHEIRO_PRAZO', 'DINHEIRO_VISTA', 'MISTO');

-- CreateEnum
CREATE TYPE "StatusTerreno" AS ENUM ('PROSPECCAO', 'EM_NEGOCIACAO', 'PROPOSTA_ENVIADA', 'PROPOSTA_ACEITA', 'CONTRATO_EM_ELABORACAO', 'CONTRATO_ASSINADO', 'DESCARTADO');

-- CreateEnum
CREATE TYPE "StatusProposta" AS ENUM ('RASCUNHO', 'ENVIADA', 'EM_NEGOCIACAO', 'ACEITA', 'RECUSADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "StatusContrato" AS ENUM ('MINUTA', 'EM_REVISAO', 'ANALISE_JURIDICA', 'APROVADO', 'ASSINADO', 'RESCINDIDO');

-- CreateEnum
CREATE TYPE "RiscoOnus" AS ENUM ('BAIXO', 'MEDIO', 'ALTO', 'IMPEDITIVO');

-- CreateEnum
CREATE TYPE "TipoDocumentoDueDiligence" AS ENUM ('CPF', 'CNPJ');

-- CreateEnum
CREATE TYPE "TipoLancamentoFinanceiro" AS ENUM ('PARCELA_TERRENISTA', 'IPTU', 'MANUTENCAO', 'CERCA', 'COMISSAO', 'CARTORIO', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusLancamento" AS ENUM ('PREVISTO', 'A_PAGAR', 'PAGO', 'ATRASADO');

-- CreateEnum
CREATE TYPE "TipoAuditoria" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ANALISTA',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terrenos" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nome" TEXT NOT NULL,
    "apelido" TEXT,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "cep" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "areaTerreno" DOUBLE PRECISION NOT NULL,
    "origem" "OrigemTerreno" NOT NULL DEFAULT 'MANUAL',
    "zenkitItemId" TEXT,
    "dataProspeccao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "zoneamento" TEXT,
    "coeficienteAproveitamento" DOUBLE PRECISION,
    "numUnidadesEstimado" INTEGER,
    "areaPrivativaMedia" DOUBLE PRECISION,
    "vgvEstimado" DOUBLE PRECISION,
    "valorPedido" DOUBLE PRECISION,
    "valorCompra" DOUBLE PRECISION,
    "formaPagamento" "FormaPagamento",
    "prazoPagamento" INTEGER,
    "percentualPermuta" DOUBLE PRECISION,
    "descricaoPermuta" TEXT,
    "status" "StatusTerreno" NOT NULL DEFAULT 'PROSPECCAO',
    "createdBy" TEXT NOT NULL,
    "responsavelId" TEXT,
    "corretorId" TEXT,

    CONSTRAINT "terrenos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terreno_status_historico" (
    "id" TEXT NOT NULL,
    "terrenoId" TEXT NOT NULL,
    "statusAnterior" "StatusTerreno",
    "statusNovo" "StatusTerreno" NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "terreno_status_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proprietarios" (
    "id" TEXT NOT NULL,
    "nomeRazaoSocial" TEXT NOT NULL,
    "cpfCnpj" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "representanteLegal" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "proprietarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terreno_proprietarios" (
    "id" TEXT NOT NULL,
    "terrenoId" TEXT NOT NULL,
    "proprietarioId" TEXT NOT NULL,
    "percentual" DOUBLE PRECISION,
    "principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "terreno_proprietarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corretores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "creci" TEXT,
    "percentualComissao" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "corretores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propostas" (
    "id" TEXT NOT NULL,
    "terrenoId" TEXT NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "dataEnvio" TIMESTAMP(3),
    "validade" TIMESTAMP(3),
    "valorProposto" DOUBLE PRECISION,
    "formaPagamento" "FormaPagamento",
    "prazo" INTEGER,
    "percentualPermuta" DOUBLE PRECISION,
    "condicoesEspeciais" TEXT,
    "status" "StatusProposta" NOT NULL DEFAULT 'RASCUNHO',
    "motivoRecusa" TEXT,
    "baseParaContrato" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "propostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" TEXT NOT NULL,
    "terrenoId" TEXT NOT NULL,
    "propostaId" TEXT,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "clausulas" JSONB,
    "status" "StatusContrato" NOT NULL DEFAULT 'MINUTA',
    "dataAssinatura" TIMESTAMP(3),
    "dataVencimento" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matriculas" (
    "id" TEXT NOT NULL,
    "terrenoId" TEXT NOT NULL,
    "numero" TEXT,
    "cartorio" TEXT,
    "comarca" TEXT,
    "dadosExtraidos" JSONB,
    "arquivos" JSONB,
    "onus" JSONB,
    "riscoOnus" "RiscoOnus",
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "matriculas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "due_diligences" (
    "id" TEXT NOT NULL,
    "proprietarioId" TEXT NOT NULL,
    "terrenoId" TEXT,
    "tipo" "TipoDocumentoDueDiligence" NOT NULL,
    "dataAnalise" TIMESTAMP(3),
    "fonte" TEXT,
    "resultado" JSONB,
    "checklist" JSONB,
    "resumo" TEXT,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "due_diligences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos_financeiros" (
    "id" TEXT NOT NULL,
    "terrenoId" TEXT NOT NULL,
    "contratoId" TEXT,
    "tipo" "TipoLancamentoFinanceiro" NOT NULL,
    "descricao" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "vencimento" TIMESTAMP(3),
    "status" "StatusLancamento" NOT NULL DEFAULT 'PREVISTO',
    "dataPagamento" TIMESTAMP(3),
    "comprovante" TEXT,
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "recorrencia" TEXT,
    "recorrenciaConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "lancamentos_financeiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "terrenoId" TEXT,
    "tipo" "TipoAuditoria" NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "camposAlterados" JSONB,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zenkit_sync_logs" (
    "id" TEXT NOT NULL,
    "iniciado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluido" TIMESTAMP(3),
    "criados" INTEGER NOT NULL DEFAULT 0,
    "atualizados" INTEGER NOT NULL DEFAULT 0,
    "erros" INTEGER NOT NULL DEFAULT 0,
    "log" JSONB,
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',

    CONSTRAINT "zenkit_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_supabaseId_key" ON "usuarios"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "terreno_proprietarios_terrenoId_proprietarioId_key" ON "terreno_proprietarios"("terrenoId", "proprietarioId");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "configuracoes"("chave");

-- AddForeignKey
ALTER TABLE "terrenos" ADD CONSTRAINT "terrenos_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terrenos" ADD CONSTRAINT "terrenos_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terrenos" ADD CONSTRAINT "terrenos_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "corretores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terreno_status_historico" ADD CONSTRAINT "terreno_status_historico_terrenoId_fkey" FOREIGN KEY ("terrenoId") REFERENCES "terrenos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terreno_proprietarios" ADD CONSTRAINT "terreno_proprietarios_terrenoId_fkey" FOREIGN KEY ("terrenoId") REFERENCES "terrenos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terreno_proprietarios" ADD CONSTRAINT "terreno_proprietarios_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "proprietarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_terrenoId_fkey" FOREIGN KEY ("terrenoId") REFERENCES "terrenos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_terrenoId_fkey" FOREIGN KEY ("terrenoId") REFERENCES "terrenos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "propostas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_terrenoId_fkey" FOREIGN KEY ("terrenoId") REFERENCES "terrenos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "due_diligences" ADD CONSTRAINT "due_diligences_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "proprietarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "due_diligences" ADD CONSTRAINT "due_diligences_terrenoId_fkey" FOREIGN KEY ("terrenoId") REFERENCES "terrenos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos_financeiros" ADD CONSTRAINT "lancamentos_financeiros_terrenoId_fkey" FOREIGN KEY ("terrenoId") REFERENCES "terrenos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos_financeiros" ADD CONSTRAINT "lancamentos_financeiros_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_terrenoId_fkey" FOREIGN KEY ("terrenoId") REFERENCES "terrenos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

