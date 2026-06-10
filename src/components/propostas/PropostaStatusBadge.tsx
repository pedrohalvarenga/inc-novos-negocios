import type { StatusProposta } from "@prisma/client";

const STATUS_CONFIG: Record<StatusProposta, { label: string; bg: string; text: string }> = {
  RASCUNHO:       { label: "Rascunho",       bg: "#F3F4F6", text: "#374151" },
  ENVIADA:        { label: "Enviada",         bg: "#DBEAFE", text: "#1E40AF" },
  EM_NEGOCIACAO:  { label: "Em Negociação",   bg: "#FEF3C7", text: "#92400E" },
  ACEITA:         { label: "Aceita",          bg: "#D1FAE5", text: "#065F46" },
  RECUSADA:       { label: "Recusada",        bg: "#FEE2E2", text: "#991B1B" },
  EXPIRADA:       { label: "Expirada",        bg: "#F3F4F6", text: "#6B7280" },
};

export default function PropostaStatusBadge({ status }: { status: StatusProposta }) {
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

export function getPropostaStatusConfig(status: StatusProposta) {
  return STATUS_CONFIG[status] ?? { label: status, bg: "#F3F4F6", text: "#374151" };
}
