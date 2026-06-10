import { STATUS_TERRENO_LABELS } from "@/lib/constants";
import { formatDate, formatDays } from "@/lib/formatters";

interface HistoricoItem {
  id: string;
  statusAnterior: string | null;
  statusNovo: string;
  observacao: string | null;
  createdAt: string;
  createdBy: string;
}

interface Props {
  historico: HistoricoItem[];
}

export default function StatusTimeline({ historico }: Props) {
  if (!historico?.length) {
    return (
      <p className="text-sm text-[#A0A0A0] py-8 text-center">
        Nenhum registro de histórico disponível.
      </p>
    );
  }

  const sorted = [...historico].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-0">
      {sorted.map((item, i) => {
        const anterior = sorted[i + 1];
        const diasNaEtapa = anterior
          ? Math.floor(
              (new Date(item.createdAt).getTime() - new Date(anterior.createdAt).getTime()) /
                86400000
            )
          : null;

        return (
          <div key={item.id} className="flex gap-4">
            {/* Linha do tempo */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-[#F26522] shrink-0 mt-1" />
              {i < sorted.length - 1 && (
                <div className="w-0.5 bg-black/10 flex-1 mt-1 mb-1" style={{ minHeight: 32 }} />
              )}
            </div>

            {/* Conteúdo */}
            <div className="pb-5 min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-black">
                    {STATUS_TERRENO_LABELS[item.statusNovo as keyof typeof STATUS_TERRENO_LABELS] ?? item.statusNovo}
                  </p>
                  {item.statusAnterior && (
                    <p className="text-xs text-[#606060]">
                      ← {STATUS_TERRENO_LABELS[item.statusAnterior as keyof typeof STATUS_TERRENO_LABELS] ?? item.statusAnterior}
                    </p>
                  )}
                  {item.observacao && (
                    <p className="text-xs text-[#606060] italic mt-1">"{item.observacao}"</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-[#606060]">{formatDate(item.createdAt)}</p>
                  {diasNaEtapa != null && (
                    <p className="text-xs text-[#A0A0A0] mt-0.5">
                      {formatDays(diasNaEtapa)} nesta etapa
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
