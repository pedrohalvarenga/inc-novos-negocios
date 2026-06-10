"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface Props {
  terrenoId?: string;
  onCriado: () => void;
  onCancelar: () => void;
}

interface Proprietario {
  id: string;
  nomeRazaoSocial: string;
  cpfCnpj?: string;
}

export default function DueDiligenceForm({ terrenoId, onCriado, onCancelar }: Props) {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [proprietarioId, setProprietarioId] = useState("");
  const [tipo, setTipo] = useState<"CPF" | "CNPJ">("CPF");
  const [fonte, setFonte] = useState("Manual");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [consultandoCnpj, setConsultandoCnpj] = useState(false);
  const [resultadoCnpj, setResultadoCnpj] = useState<any>(null);

  useEffect(() => {
    fetch("/api/proprietarios")
      .then((r) => r.json())
      .then((data) => setProprietarios(Array.isArray(data) ? data : []));
  }, []);

  const proprietarioSelecionado = proprietarios.find((p) => p.id === proprietarioId);

  async function consultarReceita() {
    if (!proprietarioSelecionado?.cpfCnpj) return;
    setConsultandoCnpj(true);
    setResultadoCnpj(null);
    try {
      const res = await fetch(`/api/due-diligence/cnpj/${proprietarioSelecionado.cpfCnpj.replace(/\D/g, "")}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResultadoCnpj(data);
      setFonte("Receita Federal (BrasilAPI)");
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setConsultandoCnpj(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!proprietarioId) { setErro("Selecione um proprietário"); return; }
    setLoading(true);
    setErro("");

    const res = await fetch("/api/due-diligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proprietarioId, terrenoId, tipo, fonte }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErro(data.error ?? "Erro ao criar"); return; }
    onCriado();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black mb-1.5">Vendedor / Proprietário</label>
        <select
          value={proprietarioId}
          onChange={(e) => setProprietarioId(e.target.value)}
          className="w-full h-10 rounded-lg border border-black/20 px-3 text-sm outline-none focus:border-[#FF7924] bg-white"
        >
          <option value="">Selecione...</option>
          {proprietarios.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nomeRazaoSocial}{p.cpfCnpj ? ` — ${p.cpfCnpj}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1.5">Tipo de Documento</label>
        <div className="flex gap-2">
          {(["CPF", "CNPJ"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`flex-1 h-10 rounded-lg border text-sm font-semibold transition-colors ${tipo === t ? "bg-[#FF7924] border-[#FF7924] text-white" : "bg-white border-black/20 text-black hover:bg-[#F7F7F7]"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Consulta automática Receita Federal para CNPJ */}
      {tipo === "CNPJ" && proprietarioSelecionado?.cpfCnpj && (
        <div className="rounded-xl border border-black/8 bg-[#F7F7F7] p-4">
          <p className="text-xs text-[#606060] mb-2">Consultar situação cadastral na Receita Federal (gratuito)</p>
          <button
            type="button"
            onClick={consultarReceita}
            disabled={consultandoCnpj}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-black/20 bg-white text-sm font-medium text-black hover:bg-[#F7F7F7] transition-colors disabled:opacity-50"
          >
            {consultandoCnpj ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {consultandoCnpj ? "Consultando..." : "Consultar CNPJ"}
          </button>
          {resultadoCnpj && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-1 text-green-700 text-xs font-semibold">
                <CheckCircle size={12} /> Consulta realizada com sucesso
              </div>
              <p className="text-sm font-medium text-black">{resultadoCnpj.nome}</p>
              <p className="text-xs text-[#606060]">Situação: {resultadoCnpj.situacaoCadastral}</p>
              {resultadoCnpj.dataAbertura && <p className="text-xs text-[#606060]">Abertura: {resultadoCnpj.dataAbertura}</p>}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-black mb-1.5">Fonte / Provedor</label>
        <input
          value={fonte}
          onChange={(e) => setFonte(e.target.value)}
          className="w-full h-10 rounded-lg border border-black/20 px-3 text-sm outline-none focus:border-[#FF7924]"
          placeholder="Ex: Manual, Receita Federal, BigDataCorp..."
        />
      </div>

      {erro && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={14} className="text-red-600" />
          <p className="text-sm text-red-700">{erro}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={onCancelar} className="flex-1 h-10 rounded-lg border border-black/20 text-sm font-medium text-black hover:bg-[#F7F7F7] transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="flex-1 h-10 rounded-lg bg-[#FF7924] text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50">
          {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Criar Due Diligence"}
        </button>
      </div>
    </form>
  );
}
