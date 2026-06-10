import type { StatusTerreno, FormaPagamento } from "@prisma/client";

export const STATUS_TERRENO_LABELS: Record<StatusTerreno, string> = {
  PROSPECCAO: "Prospecção",
  EM_NEGOCIACAO: "Em Negociação",
  PROPOSTA_ENVIADA: "Proposta Enviada",
  PROPOSTA_ACEITA: "Proposta Aceita",
  CONTRATO_EM_ELABORACAO: "Contrato em Elaboração",
  CONTRATO_ASSINADO: "Contrato Assinado",
  DESCARTADO: "Descartado",
};

export const STATUS_TERRENO_ORDER: StatusTerreno[] = [
  "PROSPECCAO",
  "EM_NEGOCIACAO",
  "PROPOSTA_ENVIADA",
  "PROPOSTA_ACEITA",
  "CONTRATO_EM_ELABORACAO",
  "CONTRATO_ASSINADO",
];

export const FORMA_PAGAMENTO_LABELS: Record<FormaPagamento, string> = {
  PERMUTA_FISICA: "Permuta Física",
  PERMUTA_FINANCEIRA: "Permuta Financeira",
  DINHEIRO_PRAZO: "Dinheiro a Prazo",
  DINHEIRO_VISTA: "Dinheiro à Vista",
  MISTO: "Misto",
};

export const UF_OPTIONS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export const STATUS_COLORS: Record<StatusTerreno, { bg: string; text: string }> = {
  PROSPECCAO:             { bg: "#F3F4F6", text: "#374151" },
  EM_NEGOCIACAO:          { bg: "#FEF3C7", text: "#92400E" },
  PROPOSTA_ENVIADA:       { bg: "#DBEAFE", text: "#1E40AF" },
  PROPOSTA_ACEITA:        { bg: "#D1FAE5", text: "#065F46" },
  CONTRATO_EM_ELABORACAO: { bg: "#FFF0E8", text: "#C2410C" },
  CONTRATO_ASSINADO:      { bg: "#000000", text: "#FFFFFF" },
  DESCARTADO:             { bg: "#FEE2E2", text: "#991B1B" },
};
