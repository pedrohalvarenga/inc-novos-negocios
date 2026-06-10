import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  highlight?: boolean;
  className?: string;
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlight = false,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 flex flex-col gap-3",
        highlight ? "border-[#F26522]/30 bg-[#FFF8F4]" : "border-black/8",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-[#606060] uppercase tracking-wide">{title}</p>
        {Icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              highlight ? "bg-[#F26522]/12" : "bg-[#F7F7F7]"
            )}
          >
            <Icon size={16} className={highlight ? "text-[#F26522]" : "text-[#606060]"} />
          </div>
        )}
      </div>
      <div>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight",
            highlight ? "text-[#F26522]" : "text-black"
          )}
        >
          {value}
        </p>
        {subtitle && <p className="text-xs text-[#606060] mt-0.5">{subtitle}</p>}
      </div>
      {trend && (
        <p
          className={cn(
            "text-xs font-medium",
            trend.positive ? "text-green-600" : "text-[#606060]"
          )}
        >
          {trend.value}
        </p>
      )}
    </div>
  );
}
