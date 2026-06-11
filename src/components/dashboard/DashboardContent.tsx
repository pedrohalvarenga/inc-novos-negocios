"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  FileText,
  CheckCircle,
  TrendingUp,
  Building2,
  DollarSign,
  Percent,
  Home,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import KPICard from "@/components/common/KPICard";
import StatusBadge from "@/components/common/StatusBadge";
import ScoreBadge from "@/components/common/ScoreBadge";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import { formatCurrency, formatPercent, formatDays, formatNumber } from "@/lib/formatters";
import { FORMA_PAGAMENTO_LABELS, STATUS_TERRENO_LABELS } from "@/lib/constants";
import { faixaVgvColor } from "@/lib/score";
import Link from "next/link";

export default function DashboardContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!data || data.error || !data.kpis) {
    return (
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-6 max-w-xl">
        <p className="font-medium text-[#1a1a1a] mb-1">Não foi possível carregar o dashboard</p>
        <p className="text-sm text-[#606060]">
          {data?.mensagem ?? "Erro ao carregar dados. Recarregue a página em alguns instantes."}
        </p>
      </div>
    );
  }

  const { kpis, funil, cidades, tempoMedioEtapas, tabelaTerrenos } = data;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Visão geral do pipeline de novos negócios"
      />

      {/* KPIs primários */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Em Negociação"
          value={kpis.terrenosEmNegociacao}
          icon={MapPin}
          subtitle="terrenos ativos"
        />
        <KPICard
          title="Propostas Ativas"
          value={kpis.propostasAtivas}
          icon={FileText}
          subtitle="aguardando retorno"
        />
        <KPICard
          title="Contratos em Elab."
          value={kpis.contratosEmElaboracao}
          icon={Building2}
          subtitle="em andamento"
        />
        <KPICard
          title="Contratos Assinados"
          value={kpis.contratosAssinados}
          icon={CheckCircle}
          subtitle="finalizados"
        />
      </div>

      {/* KPIs financeiros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="VGV Total Pipeline"
          value={formatCurrency(kpis.vgvTotalPipeline)}
          icon={TrendingUp}
          highlight
          subtitle="valor geral de vendas"
        />
        <KPICard
          title="Valor Total de Compra"
          value={formatCurrency(kpis.valorTotalCompra)}
          icon={DollarSign}
          subtitle="negociado até agora"
        />
        <KPICard
          title="% Médio Terreno/VGV"
          value={kpis.percentualMedioTerreno != null ? formatPercent(kpis.percentualMedioTerreno) : "—"}
          icon={Percent}
          subtitle="meta: até 10%"
        />
        <KPICard
          title="Total de Unidades"
          value={formatNumber(kpis.totalUnidades)}
          icon={Home}
          subtitle="unidades no pipeline"
        />
      </div>

      {/* Funil + Tempo médio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Funil */}
        <div className="lg:col-span-2 rounded-xl border border-black/8 bg-white p-6">
          <h2 className="text-sm font-semibold text-black mb-5">Funil do Pipeline</h2>
          <div className="space-y-2">
            {funil.map((etapa: any) => {
              const maxQtd = Math.max(...funil.map((e: any) => e.quantidade), 1);
              const pct = (etapa.quantidade / maxQtd) * 100;
              return (
                <div key={etapa.status} className="flex items-center gap-3">
                  <span className="w-40 text-xs text-[#606060] truncate shrink-0">{etapa.label}</span>
                  <div className="flex-1 h-7 rounded-lg bg-[#F7F7F7] overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: etapa.quantidade > 0 ? "#F26522" : "#E5E5E5",
                        opacity: etapa.quantidade > 0 ? 1 : 0.4,
                      }}
                    />
                    {etapa.quantidade > 0 && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white">
                        {etapa.quantidade}
                      </span>
                    )}
                  </div>
                  <span className="w-28 text-right text-xs text-[#606060] shrink-0">
                    {formatCurrency(etapa.vgv)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tempo médio */}
        <div className="rounded-xl border border-black/8 bg-white p-6">
          <h2 className="text-sm font-semibold text-black mb-5">Tempo Médio por Etapa</h2>
          <div className="space-y-3">
            {tempoMedioEtapas.map((e: any) => (
              <div key={e.status} className="flex items-center justify-between">
                <span className="text-xs text-[#606060] truncate">{e.label}</span>
                <span className="text-xs font-semibold text-black shrink-0 ml-2">
                  {e.diasMedio > 0 ? formatDays(e.diasMedio) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico por cidade */}
      {cidades.length > 0 && (
        <div className="rounded-xl border border-black/8 bg-white p-6">
          <h2 className="text-sm font-semibold text-black mb-5">Distribuição por Cidade</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cidades.slice(0, 10)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis
                dataKey="cidade"
                tick={{ fontSize: 11, fill: "#606060" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#606060" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(v) => formatCurrency(Number(v))}
                labelStyle={{ fontSize: 12, fontWeight: 600 }}
                contentStyle={{
                  border: "1px solid #E5E5E5",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="vgv" name="VGV" radius={[4, 4, 0, 0]}>
                {cidades.slice(0, 10).map((_: any, i: number) => (
                  <Cell key={i} fill={i === 0 ? "#F26522" : "#000000"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabela top terrenos */}
      <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-black/6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-black">Ranking — Melhores Negócios</h2>
          <Link href="/terrenos" className="text-xs text-[#F26522] font-medium hover:underline">
            Ver todos →
          </Link>
        </div>

        {tabelaTerrenos.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Nenhum terreno cadastrado"
            description="Cadastre o primeiro terreno para visualizar o ranking."
            compact
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/6">
                  {[
                    "Terreno", "Cidade", "Status", "Unid.", "VGV", "Valor Compra", "% VGV", "Pagamento", "Score", "Dias/Etapa"
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#606060] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/4">
                {tabelaTerrenos.slice(0, 15).map((t: any) => (
                  <tr key={t.id} className="hover:bg-[#F7F7F7] transition-colors">
                    <td className="px-4 py-3 font-medium text-black whitespace-nowrap">
                      <Link href={`/terrenos/${t.id}`} className="hover:text-[#F26522] transition-colors">
                        {t.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#606060] whitespace-nowrap">
                      {t.cidade}/{t.uf}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-[#606060] text-center">
                      {t.numUnidadesEstimado ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#606060] whitespace-nowrap">
                      {formatCurrency(t.vgvEstimado)}
                    </td>
                    <td className="px-4 py-3 text-[#606060] whitespace-nowrap">
                      {formatCurrency(t.valorCompra)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {t.percentualTerreno != null ? (
                        <span
                          className="font-semibold"
                          style={{ color: faixaVgvColor(t.percentualTerreno <= 10 ? "verde" : t.percentualTerreno <= 15 ? "amarelo" : "vermelho") }}
                        >
                          {formatPercent(t.percentualTerreno)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#606060] whitespace-nowrap text-xs">
                      {t.formaPagamento ? FORMA_PAGAMENTO_LABELS[t.formaPagamento as keyof typeof FORMA_PAGAMENTO_LABELS] : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={t.score} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-[#606060] text-right">
                      {t.diasNaEtapa}d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Card Financeiro */}
      <CardFinanceiroDashboard />
    </div>
  );
}

function CardFinanceiroDashboard() {
  const [fin, setFin] = useState<any>(null);

  useEffect(() => {
    fetch("/api/financeiro/lancamentos")
      .then((r) => r.json())
      .then((ls: any[]) => {
        if (!Array.isArray(ls)) return;
        const hoje = new Date();
        const aPagar = ls.filter((l) => l.status === "A_PAGAR").reduce((s, l) => s + l.valor, 0);
        const atrasados = ls.filter((l) => l.status === "ATRASADO");
        const totalAtrasado = atrasados.reduce((s, l) => s + l.valor, 0);
        const proximos = ls
          .filter((l) => l.status !== "PAGO" && l.vencimento && new Date(l.vencimento) >= hoje)
          .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());
        setFin({ aPagar, qtdAtrasados: atrasados.length, totalAtrasado, proximo: proximos[0] ?? null });
      })
      .catch(() => {});
  }, []);

  if (!fin) return null;

  return (
    <div className="rounded-xl border border-black/8 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-black">Financeiro — Resumo do Mês</h2>
        <Link href="/financeiro" className="text-xs text-[#F26522] font-medium hover:underline">Ver detalhes →</Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[#F7F7F7]">
          <p className="text-xs text-[#606060] mb-1">A pagar no mês</p>
          <p className="text-base font-semibold text-yellow-700">{formatCurrency(fin.aPagar)}</p>
        </div>
        <div className={`p-4 rounded-lg ${fin.qtdAtrasados > 0 ? "bg-red-50" : "bg-[#F7F7F7]"}`}>
          <p className="text-xs text-[#606060] mb-1">Atrasados ({fin.qtdAtrasados})</p>
          <p className={`text-base font-semibold ${fin.qtdAtrasados > 0 ? "text-red-700" : "text-[#606060]"}`}>
            {formatCurrency(fin.totalAtrasado)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-[#F7F7F7]">
          <p className="text-xs text-[#606060] mb-1">Próximo vencimento</p>
          {fin.proximo ? (
            <div>
              <p className="text-sm font-semibold text-black">{formatCurrency(fin.proximo.valor)}</p>
              <p className="text-xs text-[#606060]">{new Date(fin.proximo.vencimento).toLocaleDateString("pt-BR")}</p>
            </div>
          ) : (
            <p className="text-sm text-[#A0A0A0]">—</p>
          )}
        </div>
      </div>
    </div>
  );
}
