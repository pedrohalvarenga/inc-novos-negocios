"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Edit, Trash2, Clock } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import ScoreBadge from "@/components/common/ScoreBadge";
import EmptyState from "@/components/common/EmptyState";
import CalculadoraViabilidade from "@/components/viabilidade/CalculadoraViabilidade";
import StatusTimeline from "@/components/common/StatusTimeline";
import StatusMover from "@/components/terrenos/StatusMover";
import PropostasTab from "@/components/propostas/PropostasTab";
import ContratoTab from "@/components/contratos/ContratoTab";
import { formatCurrency, formatArea, formatDate, formatPercent } from "@/lib/formatters";
import { FORMA_PAGAMENTO_LABELS } from "@/lib/constants";
import { calcularScore } from "@/lib/score";
import { FileText, Scale, CreditCard, Lock } from "lucide-react";
import MatriculaTab from "@/components/matricula/MatriculaTab";
import DueDiligenceTab from "@/components/due-diligence/DueDiligenceTab";
import FinanceiroTab from "@/components/financeiro/FinanceiroTab";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "dados", label: "Dados" },
  { key: "viabilidade", label: "Viabilidade" },
  { key: "propostas", label: "Propostas" },
  { key: "contrato", label: "Contrato" },
  { key: "matricula", label: "Matrícula & DD" },
  { key: "financeiro", label: "Financeiro" },
  { key: "historico", label: "Histórico" },
];

const TABS_FUTURAS = new Set<string>([]);

interface Props { id: string }

export default function TerrenoDetail({ id }: Props) {
  const [terreno, setTerreno] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dados");
  const [usuarioRole, setUsuarioRole] = useState("ANALISTA");

  async function carregar() {
    const data = await fetch(`/api/terrenos/${id}`).then((r) => r.json());
    setTerreno(data);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [id]);

  useEffect(() => {
    fetch("/api/usuarios/me").then((r) => r.json()).then((u) => {
      if (u?.role) setUsuarioRole(u.role);
    }).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-6 w-32 bg-gray-100 rounded" />
        <div className="h-10 w-64 bg-gray-100 rounded" />
        <div className="h-96 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!terreno || terreno.error) {
    return (
      <div className="p-8">
        <EmptyState icon={FileText} title="Terreno não encontrado" />
      </div>
    );
  }

  const { score } = calcularScore({
    valorCompra: terreno.valorCompra,
    vgvEstimado: terreno.vgvEstimado,
    formaPagamento: terreno.formaPagamento,
    prazoPagamento: terreno.prazoPagamento,
  });

  const pct = terreno.valorCompra && terreno.vgvEstimado && terreno.vgvEstimado > 0
    ? (terreno.valorCompra / terreno.vgvEstimado) * 100
    : null;

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <Link
        href="/terrenos"
        className="flex items-center gap-1 text-sm text-[#606060] hover:text-black transition-colors mb-6"
      >
        <ChevronLeft size={15} />
        Terrenos
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-black tracking-tight">{terreno.nome}</h1>
            <StatusBadge status={terreno.status} />
          </div>
          <p className="text-sm text-[#606060] mt-1">
            {terreno.bairro} · {terreno.cidade}/{terreno.uf}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <ScoreBadge score={score} size="md" showLabel />
          <StatusMover terreno={terreno} onUpdate={carregar} />
          <Link
            href={`/terrenos/${id}/editar`}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-black/20 text-sm font-medium text-black hover:bg-[#F7F7F7] transition-colors"
          >
            <Edit size={14} />
            Editar
          </Link>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "VGV Estimado", value: formatCurrency(terreno.vgvEstimado) },
          { label: "Valor de Compra", value: formatCurrency(terreno.valorCompra) },
          { label: "% Terreno/VGV", value: pct != null ? formatPercent(pct) : "—" },
          { label: "Área do Terreno", value: formatArea(terreno.areaTerreno) },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-black/8 bg-white p-4">
            <p className="text-xs text-[#606060] mb-1">{k.label}</p>
            <p className="text-base font-semibold text-black">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-black/8 mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                tab === t.key
                  ? "border-[#F26522] text-[#F26522]"
                  : "border-transparent text-[#606060] hover:text-black"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das abas */}
      {tab === "dados" && <TabDados terreno={terreno} />}
      {tab === "viabilidade" && (
        <CalculadoraViabilidade terreno={terreno} onSave={carregar} />
      )}
      {tab === "propostas" && (
        <PropostasTab terrenoId={id} terreno={terreno} usuarioRole={usuarioRole} />
      )}
      {tab === "contrato" && (
        <ContratoTab terrenoId={id} terrenoNome={terreno.nome} />
      )}
      {tab === "matricula" && (
        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-black mb-4 flex items-center gap-2">
              <FileText size={16} className="text-[#FF7924]" /> Matrícula
            </h3>
            <MatriculaTab terrenoId={id} />
          </section>
          <section>
            <h3 className="text-sm font-semibold text-black mb-4 flex items-center gap-2">
              <Scale size={16} className="text-[#FF7924]" /> Due Diligence
            </h3>
            <DueDiligenceTab terrenoId={id} />
          </section>
        </div>
      )}
      {tab === "financeiro" && (
        <FinanceiroTab terrenoId={id} usuarioRole={usuarioRole} />
      )}
      {tab === "historico" && <TabHistorico historico={terreno.statusHistorico} />}
      {TABS_FUTURAS.has(tab) && <TabFutura label={TABS.find((t) => t.key === tab)?.label ?? ""} />}
    </div>
  );
}

function TabDados({ terreno }: { terreno: any }) {
  function Row({ label, value }: { label: string; value?: string | null }) {
    return (
      <div className="flex items-start justify-between py-2.5 border-b border-black/6 last:border-0">
        <span className="text-sm text-[#606060] shrink-0 w-44">{label}</span>
        <span className="text-sm font-medium text-black text-right">{value || "—"}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Localização */}
      <div className="rounded-xl border border-black/8 bg-white p-6">
        <h3 className="text-sm font-semibold text-black mb-4">Localização</h3>
        <Row label="Logradouro" value={[terreno.logradouro, terreno.numero, terreno.complemento].filter(Boolean).join(", ")} />
        <Row label="Bairro" value={terreno.bairro} />
        <Row label="Cidade / UF" value={`${terreno.cidade} / ${terreno.uf}`} />
        <Row label="CEP" value={terreno.cep} />
        <Row label="Área do Terreno" value={formatArea(terreno.areaTerreno)} />
      </div>

      {/* Potencial construtivo */}
      <div className="rounded-xl border border-black/8 bg-white p-6">
        <h3 className="text-sm font-semibold text-black mb-4">Potencial Construtivo</h3>
        <Row label="Zoneamento" value={terreno.zoneamento} />
        <Row label="Coef. de Aproveitamento" value={terreno.coeficienteAproveitamento?.toString()} />
        <Row label="Unidades Estimadas" value={terreno.numUnidadesEstimado?.toString()} />
        <Row label="Área Privativa Média" value={formatArea(terreno.areaPrivativaMedia)} />
        <Row label="VGV Estimado" value={formatCurrency(terreno.vgvEstimado)} />
      </div>

      {/* Negociação */}
      <div className="rounded-xl border border-black/8 bg-white p-6">
        <h3 className="text-sm font-semibold text-black mb-4">Negociação</h3>
        <Row label="Valor Pedido" value={formatCurrency(terreno.valorPedido)} />
        <Row label="Valor de Compra" value={formatCurrency(terreno.valorCompra)} />
        <Row label="Forma de Pagamento" value={terreno.formaPagamento ? FORMA_PAGAMENTO_LABELS[terreno.formaPagamento as keyof typeof FORMA_PAGAMENTO_LABELS] : undefined} />
        <Row label="Prazo" value={terreno.prazoPagamento ? `${terreno.prazoPagamento} meses` : undefined} />
        <Row label="% Permuta" value={terreno.percentualPermuta ? `${terreno.percentualPermuta}%` : undefined} />
        {terreno.descricaoPermuta && <Row label="Desc. Permuta" value={terreno.descricaoPermuta} />}
      </div>

      {/* Proprietários + origem */}
      <div className="rounded-xl border border-black/8 bg-white p-6">
        <h3 className="text-sm font-semibold text-black mb-4">Proprietários</h3>
        {terreno.proprietarios?.length ? (
          <div className="space-y-2">
            {terreno.proprietarios.map((tp: any) => (
              <div key={tp.id} className="flex items-center justify-between p-3 bg-[#F7F7F7] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-black">{tp.proprietario.nomeRazaoSocial}</p>
                  {tp.proprietario.cpfCnpj && (
                    <p className="text-xs text-[#606060]">{tp.proprietario.cpfCnpj}</p>
                  )}
                </div>
                {tp.percentual && (
                  <span className="text-xs font-semibold text-[#606060]">{tp.percentual}%</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#A0A0A0]">Nenhum proprietário cadastrado</p>
        )}

        {terreno.corretor && (
          <div className="mt-4 pt-4 border-t border-black/6">
            <p className="text-xs text-[#606060] mb-1">Corretor</p>
            <p className="text-sm font-medium text-black">{terreno.corretor.nome}</p>
            {terreno.corretor.percentualComissao && (
              <p className="text-xs text-[#606060]">Comissão: {terreno.corretor.percentualComissao}%</p>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-black/6 space-y-1">
          <Row label="Prospecção" value={formatDate(terreno.dataProspeccao)} />
          <Row label="Responsável" value={terreno.responsavel?.nome} />
          <Row label="Cadastrado por" value={terreno.criador?.nome} />
        </div>
      </div>
    </div>
  );
}

function TabHistorico({ historico }: { historico: any[] }) {
  return <StatusTimeline historico={historico} />;
}

function TabFutura({ label }: { label: string }) {
  return (
    <EmptyState
      icon={Lock}
      title={`${label} — Disponível em breve`}
      description="Este módulo estará disponível em uma próxima fase do sistema."
    />
  );
}
