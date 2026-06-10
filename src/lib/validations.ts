import { z } from "zod";

export const TerrenoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  apelido: z.string().optional().nullable(),
  logradouro: z.string().min(3, "Endereço obrigatório"),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().min(2, "Bairro obrigatório"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  uf: z.string().length(2, "UF inválida"),
  cep: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  areaTerreno: z.number().positive("Área deve ser positiva"),

  origem: z.enum(["ZENKIT", "MANUAL"]).default("MANUAL"),
  zenkitItemId: z.string().optional().nullable(),
  dataProspeccao: z.string().optional(),

  zoneamento: z.string().optional().nullable(),
  coeficienteAproveitamento: z.number().optional().nullable(),
  numUnidadesEstimado: z.number().int().positive().optional().nullable(),
  areaPrivativaMedia: z.number().positive().optional().nullable(),
  vgvEstimado: z.number().positive().optional().nullable(),

  valorPedido: z.number().positive().optional().nullable(),
  valorCompra: z.number().positive().optional().nullable(),
  formaPagamento: z.enum([
    "PERMUTA_FISICA",
    "PERMUTA_FINANCEIRA",
    "DINHEIRO_PRAZO",
    "DINHEIRO_VISTA",
    "MISTO",
  ]).optional().nullable(),
  prazoPagamento: z.number().int().positive().optional().nullable(),
  percentualPermuta: z.number().min(0).max(100).optional().nullable(),
  descricaoPermuta: z.string().optional().nullable(),

  responsavelId: z.string().optional().nullable(),

  proprietarios: z.array(z.object({
    proprietarioId: z.string(),
    percentual: z.number().min(0).max(100).optional().nullable(),
    principal: z.boolean().default(false),
  })).optional(),

  corretorId: z.string().optional().nullable(),
});

export type TerrenoInput = z.infer<typeof TerrenoSchema>;

export const ProprietarioSchema = z.object({
  nomeRazaoSocial: z.string().min(2, "Nome obrigatório"),
  cpfCnpj: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  representanteLegal: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

export type ProprietarioInput = z.infer<typeof ProprietarioSchema>;

export const CorretorSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  telefone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  creci: z.string().optional().nullable(),
  percentualComissao: z.number().min(0).max(100).optional().nullable(),
});

export type CorretorInput = z.infer<typeof CorretorSchema>;

export const StatusUpdateSchema = z.object({
  status: z.enum([
    "PROSPECCAO",
    "EM_NEGOCIACAO",
    "PROPOSTA_ENVIADA",
    "PROPOSTA_ACEITA",
    "CONTRATO_EM_ELABORACAO",
    "CONTRATO_ASSINADO",
    "DESCARTADO",
  ]),
  observacao: z.string().optional(),
});
