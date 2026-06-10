import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-10 px-4" : "py-20 px-4",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-[#F7F7F7] border border-black/8 flex items-center justify-center mb-4">
        <Icon size={22} className="text-[#A0A0A0]" />
      </div>
      <h3 className="text-sm font-semibold text-black mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#606060] max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
