import { scoreColor } from "@/lib/score";
import { cn } from "@/lib/utils";

interface Props {
  score: number | null | undefined;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function ScoreBadge({ score, size = "md", showLabel = false }: Props) {
  if (score == null) {
    return (
      <span className="text-[#A0A0A0] text-sm">—</span>
    );
  }

  const color = scoreColor(score);
  const label = score >= 70 ? "Excelente" : score >= 45 ? "Médio" : "Baixo";

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  };

  return (
    <div className={cn("flex items-center gap-2", showLabel ? "" : "")}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold shrink-0",
          sizeClasses[size]
        )}
        style={{ backgroundColor: color + "18", color, border: `2px solid ${color}30` }}
      >
        {score}
      </div>
      {showLabel && (
        <div className="leading-tight">
          <p className="text-xs font-semibold" style={{ color }}>
            {label}
          </p>
          <p className="text-[11px] text-[#606060]">Score</p>
        </div>
      )}
    </div>
  );
}
