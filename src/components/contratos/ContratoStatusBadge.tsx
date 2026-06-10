import type { StatusContrato } from "@prisma/client";

const STATUS_CONFIG: Record<StatusContrato, { label: string; bg: string; text: string }> = {
  MINUTA:           { label: "Minuta",            bg: "#F3F4F6", text: "#374151" },
  EM_REVISAO:       { label: "Em Revisão",         bg: "#FEF3C7", text: "#92400E" },
  ANALISE_JURIDICA: { label: "Análise Jurídica",   bg: "#DBEAFE", text: "#1E40AF" },
  APROVADO:         { label: "Aprovado",           bg: "#D1FAE5", text: "#065F46" },
  ASSINADO:         { label: "Assinado",           bg: "#000000", text: "#FFFFFF" },
  RESCINDIDO:       { label: "Rescindido",         bg: "#FEE2E2", text: "#991B1B" },
};

export default function ContratoStatusBadge({ status }: { status: StatusContrato }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: "#F3F4F6", text: "#374151" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}
