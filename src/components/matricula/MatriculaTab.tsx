"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Download, Loader2, AlertCircle } from "lucide-react";
import MatriculaUpload from "./MatriculaUpload";
import MatriculaConferencia from "./MatriculaConferencia";
import MatriculaRiscos, { RiscoBadge } from "./MatriculaRiscos";
import EmptyState from "@/components/common/EmptyState";
import { formatDate } from "@/lib/formatters";
import type { DadosMatricula } from "@/lib/matricula/analisarMatricula";

interface Props {
  terrenoId: string;
}

type Etapa = "lista" | "nova" | "upload" | "conferencia";

export default function MatriculaTab({ terrenoId }: Props) {
  const [matriculas, setMatriculas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [etapa, setEtapa] = useState<Etapa>("lista");
  const [matriculaAtiva, setMatriculaAtiva] = useState<any>(null);
  const [analiseResult, setAnaliseResult] = useState<{ dados: DadosMatricula; arquivos: any[] } | null>(null);
  const [erro, setErro] = useState("");
  const [criando, setCriando] = useState(false);

  async function carregar() {
    setLoading(true);
    const res = await fetch(`/api/matriculas?terrenoId=${terrenoId}`);
    const data = await res.json();
    setMatriculas(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [terrenoId]);

  async function criarMatricula() {
    setCriando(true);
    const res = await fetch("/api/matriculas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terrenoId }),
    });
    const data = await res.json();
    setCriando(false);
    if (!res.ok) { setErro(data.error ?? "Erro ao criar"); return; }
    setMatriculaAtiva(data);
    setEtapa("upload");
  }

  async function handleAnaliseCompleta(result: any) {
    setAnaliseResult({ dados: result.dados, arquivos: result.arquivos ?? [] });
    setMatriculaAtiva(result.matricula);
    setEtapa("conferencia");
  }

  async function handleConfirmar(dadosCorrigidos: DadosMatricula) {
    if (!matriculaAtiva) return;
    await fetch(`/api/matriculas/${matriculaAtiva.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numero: dadosCorrigidos.numero,
        cartorio: dadosCorrigidos.cartorioComarca?.split(" — ")[0],
        comarca: dadosCorrigidos.cartorioComarca?.split(" — ")[1],
      }),
    });
    await carregar();
    setEtapa("lista");
    setAnaliseResult(null);
    setMatriculaAtiva(null);
  }

  function abrirPdf(matriculaId: string) {
    window.open(`/api/matriculas/${matriculaId}/pdf`, "_blank");
  }

  if (loading) return <div className="p-6 animate-pulse space-y-3"><div className="h-6 w-48 bg-gray-100 rounded" /><div className="h-40 bg-gray-100 rounded-xl" /></div>;

  // Tela de upload
  if (etapa === "upload" && matriculaAtiva) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setEtapa("lista")} className="text-sm text-[#606060] hover:text-black transition-colors">← Voltar</button>
          <h3 className="text-base font-semibold text-black">Nova Análise de Matrícula</h3>
        </div>
        <MatriculaUpload
          matriculaId={matriculaAtiva.id}
          onAnaliseCompleta={handleAnaliseCompleta}
          onError={setErro}
        />
        {erro && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"><AlertCircle size={14} className="text-red-600" /><p className="text-sm text-red-700">{erro}</p></div>}
      </div>
    );
  }

  // Tela de conferência
  if (etapa === "conferencia" && analiseResult && matriculaAtiva) {
    return (
      <MatriculaConferencia
        matriculaId={matriculaAtiva.id}
        terrenoId={terrenoId}
        dados={analiseResult.dados}
        arquivos={analiseResult.arquivos}
        onConfirmar={handleConfirmar}
        onCancelar={() => { setEtapa("lista"); setAnaliseResult(null); }}
      />
    );
  }

  // Lista de matrículas
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-black">Análises de Matrícula</h3>
        <button
          onClick={criarMatricula}
          disabled={criando}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#FF7924] text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {criando ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Nova Análise
        </button>
      </div>

      {matriculas.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma matrícula analisada"
          description="Clique em 'Nova Análise' para fazer upload das fotos da matrícula e extrair dados com IA."
        />
      ) : (
        <div className="space-y-3">
          {matriculas.map((m) => (
            <div key={m.id} className="rounded-xl border border-black/8 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-black">
                      {m.numero ? `Matrícula nº ${m.numero}` : "Matrícula (sem número)"}
                    </span>
                    {m.riscoOnus && <RiscoBadge risco={m.riscoOnus} />}
                  </div>
                  {m.cartorio && <p className="text-xs text-[#606060]">{m.cartorio}{m.comarca ? ` — ${m.comarca}` : ""}</p>}
                  <p className="text-xs text-[#A0A0A0] mt-1">Atualizado em {formatDate(m.updatedAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {m.dadosExtraidos && (
                    <button
                      onClick={() => abrirPdf(m.id)}
                      className="flex items-center gap-1 h-8 px-3 rounded-lg border border-black/20 text-xs font-medium text-black hover:bg-[#F7F7F7] transition-colors"
                    >
                      <Download size={12} /> Relatório PDF
                    </button>
                  )}
                  <button
                    onClick={() => { setMatriculaAtiva(m); setEtapa("upload"); }}
                    className="flex items-center gap-1 h-8 px-3 rounded-lg bg-[#F7F7F7] text-xs font-medium text-black hover:bg-black/10 transition-colors"
                  >
                    <Plus size={12} /> Nova análise
                  </button>
                </div>
              </div>

              {m.onus && Array.isArray(m.onus) && m.onus.length > 0 && (
                <div className="mt-4 pt-4 border-t border-black/6">
                  <MatriculaRiscos onus={m.onus} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
