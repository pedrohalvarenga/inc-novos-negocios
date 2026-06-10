"use client";

const CONFIG = {
  PAGO:     { label: "Pago",     bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  PREVISTO: { label: "Previsto", bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400"   },
  A_PAGAR:  { label: "A pagar",  bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  ATRASADO: { label: "Atrasado", bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500"    },
};

export default function StatusFinanceiroBadge({ status }: { status: string }) {
  const c = CONFIG[status as keyof typeof CONFIG] ?? CONFIG.PREVISTO;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
