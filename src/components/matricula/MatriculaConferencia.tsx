"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, Edit2, X, Save, ExternalLink } from "lucide-react";
import MatriculaRiscos from "./MatriculaRiscos";
import type { DadosMatricula } from "@/lib/matricula/analisarMatricula";

interface Arquivo {
  nome: string;
  tipo: string;
  dataUrl: string;
}

interface Props {
  matriculaId: string;
  terrenoId: string;
  dados: DadosMatricula;
  arquivos: Arquivo[];
  onConfirmar: (dadosCorrigidos: DadosMatricula) => Promise<void>;
  onCancelar: () => void;
}

export default function MatriculaConferencia({ matriculaId, terrenoId, dados, arquivos, onConfirmar, onCancelar }: Props) {
  const [dadosEditados, setDadosEditados] = useState<DadosMatricula>(dados);
  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [editandoCampo, setEditandoCampo] = useState<string | null>(null);

  async function handleConfirmar() {
    setConfirmando(true);
    try {
      await onConfirmar(dadosEditados);
    } finally {
      setConfirmando(false);
    }
  }

  function EditableField({ label, field, value }: { label: string; field: string; value?: string | number | null }) {
    const [editVal, setEditVal] = useState(String(value ?? ""));
    const ativo = editandoCampo === field;

    return (
      <div className="py-2.5 border-b border-black/6 last:border-0">
        <p className="text-xs text-[#606060] mb-0.5">{label}</p>
        {ativo ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              className="flex-1 text-sm border border-[#FF7924] rounded-lg px-2 py-1 outline-none"
            />
            <button onClick={() => {
              setDadosEditados((prev) => ({ ...prev, [field]: editVal }));
              setEditandoCampo(null);
            }} className="text-[#FF7924]"><Save size={14} /></button>
            <button onClick={() => setEditandoCampo(null)} className="text-[#606060]"><X size={14} /></button>
          </div>
        ) : (
          <div className="flex items-center justify-between group">
            <p className="text-sm font-medium text-black">{String(value ?? "—")}</p>
            <button
              onClick={() => { setEditVal(String(value ?? "")); setEditandoCampo(field); }}
              className="opacity-0 group-hover:opacity-100 text-[#606060] hover:text-[#FF7924] transition-opacity"
            >
              <Edit2 size={12} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Verifica divergência de proprietários
  const proprietariosMatricula = dadosEditados.proprietariosAtuais?.map((p) => p.nome.toLowerCase()) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-black">Conferência dos Dados Extraídos</h3>
          <p className="text-sm text-[#606060]">Revise os dados extraídos pela IA antes de salvar. Clique nos campos para corrigir.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancelar} className="h-9 px-4 rounded-lg border border-black/20 text-sm font-medium text-black hover:bg-[#F7F7F7] transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={confirmando}
            className="h-9 px-4 rounded-lg bg-[#FF7924] text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {confirmando ? "Salvando..." : "Confirmar e Salvar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna esquerda: imagens */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-black">Imagens da Matrícula</h4>
          {arquivos.length > 0 ? (
            <>
              <div className="rounded-xl border border-black/8 overflow-hidden bg-[#F7F7F7]">
                <img
                  src={arquivos[imagemAtiva]?.dataUrl}
                  alt={`Página ${imagemAtiva + 1}`}
                  className="w-full max-h-96 object-contain"
                />
              </div>
              {arquivos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {arquivos.map((a, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImagemAtiva(idx)}
                      className={`shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${imagemAtiva === idx ? "border-[#FF7924]" : "border-black/10"}`}
                    >
                      <img src={a.dataUrl} alt={a.nome} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-black/8 bg-[#F7F7F7] h-48 flex items-center justify-center">
              <p className="text-sm text-[#A0A0A0]">Imagens não disponíveis</p>
            </div>
          )}
        </div>

        {/* Coluna direita: dados extraídos */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-black">Dados Extraídos pela IA</h4>

          <div className="rounded-xl border border-black/8 bg-white p-5">
            <EditableField label="Número da Matrícula" field="numero" value={dadosEditados.numero} />
            <EditableField label="Cartório / Comarca" field="cartorioComarca" value={dadosEditados.cartorioComarca} />
            <EditableField label="Área Registrada (m²)" field="areaRegistrada" value={dadosEditados.areaRegistrada} />
          </div>

          {/* Proprietários */}
          <div className="rounded-xl border border-black/8 bg-white p-5">
            <h5 className="text-sm font-semibold text-black mb-3">Proprietários Atuais</h5>
            {dadosEditados.proprietariosAtuais?.length ? (
              <div className="space-y-2">
                {dadosEditados.proprietariosAtuais.map((p, idx) => (
                  <div key={idx} className="p-3 bg-[#F7F7F7] rounded-lg">
                    <p className="text-sm font-medium text-black">{p.nome}</p>
                    {p.cpfCnpj && <p className="text-xs text-[#606060]">{p.cpfCnpj}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#A0A0A0]">Nenhum proprietário identificado</p>
            )}
          </div>

          {/* Cadeia dominial */}
          {dadosEditados.cadeiaDominial?.length > 0 && (
            <div className="rounded-xl border border-black/8 bg-white p-5">
              <h5 className="text-sm font-semibold text-black mb-3">Cadeia Dominial</h5>
              <div className="space-y-1">
                {dadosEditados.cadeiaDominial.map((d, idx) => (
                  <div key={idx} className="text-sm">
                    {d.data && <span className="font-medium text-[#FF7924]">{d.data} — </span>}
                    <span className="text-[#606060]">{d.descricao}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ônus */}
      <div>
        <h4 className="text-sm font-semibold text-black mb-3">Ônus e Gravames Identificados</h4>
        <MatriculaRiscos onus={dadosEditados.onus ?? []} riscoConsolidado={dadosEditados.riscoConsolidado} />
      </div>

      {/* Observações */}
      {dadosEditados.observacoes && (
        <div className="p-4 bg-[#F7F7F7] rounded-xl">
          <p className="text-xs text-[#606060] mb-1">Observações da IA</p>
          <p className="text-sm text-black">{dadosEditados.observacoes}</p>
        </div>
      )}
    </div>
  );
}
