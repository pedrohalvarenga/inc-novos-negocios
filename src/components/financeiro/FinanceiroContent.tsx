"use client";

import { useEffect, useState } from "react";
import { Plus, Download, RefreshCw, TrendingDown, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import LancamentosLista from "./LancamentosLista";
import CalendarioVencimentos from "./CalendarioVencimentos";
import FluxoCaixaGrafico from "./FluxoCaixaGrafico";
import LancamentoForm from "./LancamentoForm";
import { formatCurrency } from "@/lib/formatters";

const TIPOS = ["Todos", "PARCELA_TERRENISTA", "IPTU", "MANUTENCAO", "CERCA", "COMISSAO", "CARTORIO", "OUTROS"];
const TIPO_LABELS: Record<string, string> = {
  PARCELA_TERRENISTA: "Parcela Terrenista", IPTU: "IPTU", MANUTENCAO: "Manutenção",
  CERCA: "Cerca", COMISSAO: "Comissão", CARTORIO: "Cartório", OUTROS: "Outros",
};
const STATUS_OPTS = ["Todos", "PREVISTO", "A_PAGAR", "PAGO", "ATRASADO"];

export default function FinanceiroContent() {
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [terrenos, setTerrenos] = useState<any[]>([]);
  const [usuarioRole, setUsuarioRole] = useState("ANALISTA");
  const [loading, setLoading] = useState(true);

  const [filtroTerreno, setFiltroTerreno] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [view, setView] = useState<"lista" | "calendario">("lista");
  const [novoAberto, setNovoAberto] = useState(false);
  const [terrenoNovo, setTerrenoNovo] = useState("");

  async function carregar() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtroTerreno) params.set("terrenoId", filtroTerreno);
    if (filtroStatus !== "Todos") params.set("status", filtroStatus);
    if (filtroTipo !== "Todos") params.set("tipo", filtroTipo);

    const [ls, ts, me] = await Promise.all([
      fetch(`/api/financeiro/lancamentos?${params}`).then((r) => r.json()),
      fetch("/api/terrenos?limit=200").then((r) => r.json()),
      fetch("/api/usuarios/me").then((r) => r.json()).catch(() => ({})),
    ]);
    setLancamentos(Array.isArray(ls) ? ls : []);
    setTerrenos(Array.isArray(ts) ? ts : (ts.terrenos ?? []));
    if (me?.role) setUsuarioRole(me.role);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [filtroTerreno, filtroStatus, filtroTipo]);

  async function atualizarVencimentos() {
    await fetch("/api/cron/verificar-vencimentos", { method: "POST" });
    carregar();
  }

  function exportarCsv() {
    const params = filtroTerreno ? `?terrenoId=${filtroTerreno}` : "";
    window.open(`/api/financeiro/exportar${params}`, "_blank");
  }

  const total = lancamentos.reduce((s, l) => s + l.valor, 0);
  const pago = lancamentos.filter((l) => l.status === "PAGO").reduce((s, l) => s + l.valor, 0);
  const aPagar = lancamentos.filter((l) => l.status === "A_PAGAR").reduce((s, l) => s + l.valor, 0);
  const atrasado = lancamentos.filter((l) => l.status === "ATRASADO").reduce((s, l) => s + l.valor, 0);
  const qtdAtrasados = lancamentos.filter((l) => l.status === "ATRASADO").length;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Financeiro" description="Controle de pagamentos e despesas por terreno" />
        <div className="flex gap-2 shrink-0">
          <button onClick={atualizarVencimentos} title="Verificar vencimentos"
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-black/15 text-sm text-[#606060] hover:bg-[#F7F7F7]">
            <RefreshCw size={14} /> Atualizar
          </button>
          <button onClick={exportarCsv}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-black/15 text-sm text-[#606060] hover:bg-[#F7F7F7]">
            <Download size={14} /> Exportar CSV
          </button>
          <button onClick={() => setNovoAberto(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#FF7924] text-white text-sm font-medium hover:bg-[#e06a1e]">
            <Plus size={15} /> Novo lançamento
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total acumulado", value: formatCurrency(total), icon: TrendingDown, color: "text-black" },
          { label: "Pago", value: formatCurrency(pago), icon: CheckCircle, color: "text-green-600" },
          { label: "A pagar", value: formatCurrency(aPagar), icon: Clock, color: "text-yellow-600" },
          { label: `Atrasado (${qtdAtrasados})`, value: formatCurrency(atrasado), icon: AlertTriangle, color: "text-red-600" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-black/8 bg-white p-4">
            <div className="flex items-center gap-2 mb-1">
              <k.icon size={14} className={k.color} />
              <p className="text-xs text-[#606060]">{k.label}</p>
            </div>
            <p className={`text-base font-semibold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select value={filtroTerreno} onChange={(e) => setFiltroTerreno(e.target.value)}
          className="h-9 rounded-lg border border-black/15 px-3 text-sm bg-white min-w-[160px]">
          <option value="">Todos os terrenos</option>
          {terrenos.map((t: any) => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
          className="h-9 rounded-lg border border-black/15 px-3 text-sm bg-white">
          {STATUS_OPTS.map((s) => <option key={s} value={s}>{s === "Todos" ? "Todos os status" : s}</option>)}
        </select>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
          className="h-9 rounded-lg border border-black/15 px-3 text-sm bg-white">
          {TIPOS.map((t) => <option key={t} value={t}>{t === "Todos" ? "Todos os tipos" : TIPO_LABELS[t] ?? t}</option>)}
        </select>
        <div className="flex rounded-lg border border-black/15 overflow-hidden">
          {(["lista", "calendario"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 h-9 text-sm font-medium capitalize ${view === v ? "bg-black text-white" : "bg-white text-[#606060] hover:bg-[#F7F7F7]"}`}>
              {v === "lista" ? "Lista" : "Calendário"}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      {view === "calendario" ? (
        <div className="space-y-6">
          <CalendarioVencimentos lancamentos={lancamentos} />
          <FluxoCaixaGrafico terrenoId={filtroTerreno || undefined} />
        </div>
      ) : (
        <div className="space-y-6">
          <FluxoCaixaGrafico terrenoId={filtroTerreno || undefined} />
          <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-black/6 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-black">Lançamentos</h2>
              <span className="text-xs text-[#606060]">{lancamentos.length} registro(s)</span>
            </div>
            {loading ? (
              <div className="p-8 text-center text-sm text-[#606060]">Carregando…</div>
            ) : (
              <LancamentosLista
                lancamentos={lancamentos}
                usuarioRole={usuarioRole}
                onAtualizar={carregar}
                mostrarTerreno
              />
            )}
          </div>
        </div>
      )}

      {novoAberto && (
        <LancamentoForm
          terrenoId={(terrenoNovo || terrenos[0]?.id) ?? ""}
          onSalvo={() => { setNovoAberto(false); carregar(); }}
          onFechar={() => setNovoAberto(false)}
        />
      )}
    </div>
  );
}
