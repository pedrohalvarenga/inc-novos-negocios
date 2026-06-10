import type { StatusTerreno } from "@prisma/client";
import { STATUS_TERRENO_LABELS, STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Props {
  status: StatusTerreno;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: Props) {
  const label = STATUS_TERRENO_LABELS[status];
  const colors = STATUS_COLORS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {label}
    </span>
  );
}
