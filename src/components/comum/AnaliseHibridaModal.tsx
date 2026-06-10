"use client";

import { useState } from "react";
import { Copy, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { z } from "zod";

interface Props {
  titulo: string;
  descricao?: string;
  prompt: string;
  schema: z.ZodTypeAny;
  onConfirmar: (dados: unknown) => Promise<void>;
  onFechar: () => void;
}

export default function AnaliseHibridaModal({
  titulo,
  descricao,
  prompt,
  schema,
  onConfirmar,
  onFechar,
}: Props) {
  const [resposta, setResposta] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function copiarPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  function limparJson(texto: string): string {
    return texto
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  async function handleConfirmar() {
    setErro(null);
    const limpo = limparJson(resposta);
    let json: unknown;
    try {
      json = JSON.parse(limpo);
    } catch {
      setErro("JSON inválido. Certifique-se de colar somente o JSON sem texto extra.");
      return;
    }

    const result = schema.safeParse(json);
    if (!result.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msgs = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ");
      setErro(`Estrutura inválida: ${msgs}`);
      return;
    }

    setSalvando(true);
    try {
      await onConfirmar(result.data);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar análise.");
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-black">{titulo}</h2>
            {descricao && <p className="text-xs text-[#606060] mt-0.5">{descricao}</p>}
          </div>
          <button
            onClick={onFechar}
            className="text-[#A0A0A0] hover:text-black transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Instruções */}
          <div className="rounded-xl bg-[#FFF8F4] border border-[#F26522]/20 p-4 text-sm text-[#7C2D12] space-y-1.5">
            <p className="font-semibold text-[#F26522]">Modo híbrido — análise manual com Claude</p>
            <ol className="list-decimal ml-4 space-y-1 text-xs">
              <li>Copie o prompt abaixo e cole em uma nova conversa no <strong>claude.ai</strong></li>
              <li>Cole a resposta que o Claude retornar no campo abaixo</li>
              <li>Clique em <strong>Salvar análise</strong> — o sistema valida o JSON automaticamente</li>
            </ol>
          </div>

          {/* Prompt para copiar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#606060] uppercase tracking-wide">
                Prompt para o Claude
              </label>
              <button
                onClick={copiarPrompt}
                className="flex items-center gap-1.5 text-xs font-medium text-[#F26522] hover:underline transition-colors"
              >
                {copiado ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                {copiado ? "Copiado!" : "Copiar prompt"}
              </button>
            </div>
            <div className="relative">
              <pre className="text-xs text-[#606060] bg-[#F7F7F7] rounded-lg p-4 overflow-auto max-h-52 whitespace-pre-wrap font-mono leading-relaxed">
                {prompt}
              </pre>
            </div>
          </div>

          {/* Área de resposta */}
          <div>
            <label className="text-xs font-semibold text-[#606060] uppercase tracking-wide block mb-2">
              Cole aqui a resposta do Claude (JSON)
            </label>
            <textarea
              value={resposta}
              onChange={(e) => { setResposta(e.target.value); setErro(null); }}
              placeholder={'{\n  "risco": "BAIXO",\n  "explicacao": "...",\n  ...\n}'}
              rows={8}
              className="w-full rounded-xl border border-black/20 px-4 py-3 text-xs font-mono text-black bg-white outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition resize-none"
            />
          </div>

          {/* Erro */}
          {erro && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">{erro}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/8 shrink-0">
          <button
            onClick={onFechar}
            className="h-9 px-5 rounded-lg border border-black/20 text-sm font-medium text-black hover:bg-[#F7F7F7] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!resposta.trim() || salvando}
            className="h-9 px-6 rounded-lg bg-[#F26522] text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {salvando && <Loader2 size={13} className="animate-spin" />}
            {salvando ? "Salvando…" : "Salvar análise"}
          </button>
        </div>
      </div>
    </div>
  );
}
