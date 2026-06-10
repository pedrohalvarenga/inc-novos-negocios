"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileImage, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArquivoCarregado {
  nome: string;
  tipo: string;
  tamanho: number;
  dataUrl: string;
  base64: string;
}

interface Props {
  matriculaId: string;
  onAnaliseCompleta: (dados: any) => void;
  onError?: (msg: string) => void;
}

const MAX_ARQUIVOS = 20;
const MAX_TAMANHO_MB = 5;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MatriculaUpload({ matriculaId, onAnaliseCompleta, onError }: Props) {
  const [arquivos, setArquivos] = useState<ArquivoCarregado[]>([]);
  const [dragging, setDragging] = useState(false);
  const [analisando, setAnalisando] = useState(false);
  const [progresso, setProgresso] = useState("");
  const [erro, setErro] = useState("");

  const processarArquivos = useCallback(async (files: File[]) => {
    const novos: ArquivoCarregado[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") continue;
      if (file.size > MAX_TAMANHO_MB * 1024 * 1024) {
        setErro(`Arquivo "${file.name}" excede ${MAX_TAMANHO_MB}MB`);
        continue;
      }
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1];
      novos.push({ nome: file.name, tipo: file.type, tamanho: file.size, dataUrl, base64 });
    }
    setArquivos((prev) => {
      const total = [...prev, ...novos];
      return total.slice(0, MAX_ARQUIVOS);
    });
    setErro("");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processarArquivos(Array.from(e.dataTransfer.files));
  }, [processarArquivos]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processarArquivos(Array.from(e.target.files));
    e.target.value = "";
  };

  const remover = (idx: number) => setArquivos((prev) => prev.filter((_, i) => i !== idx));

  async function analisar() {
    if (!arquivos.length) return;
    setAnalisando(true);
    setErro("");
    setProgresso("Enviando imagens para análise...");

    // PDFs: avisa que serão tratados como imagem (limitação sem conversão)
    const imagens = arquivos.map((a) => ({
      data: a.base64,
      mimeType: a.tipo === "application/pdf" ? "image/jpeg" : a.tipo,
      nome: a.nome,
      tamanho: a.tamanho,
    }));

    try {
      setProgresso("Analisando matrícula com IA... Isso pode levar alguns segundos.");
      const res = await fetch(`/api/matriculas/${matriculaId}/analisar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagens }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao analisar");

      setProgresso("Análise concluída!");
      onAnaliseCompleta({ ...data, arquivos });
    } catch (e: any) {
      const msg = e.message ?? "Erro ao analisar matrícula";
      setErro(msg);
      onError?.(msg);
    } finally {
      setAnalisando(false);
      setProgresso("");
    }
  }

  return (
    <div className="space-y-4">
      {/* Zona de drop */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
          dragging ? "border-[#FF7924] bg-orange-50" : "border-black/20 hover:border-[#FF7924] hover:bg-[#F7F7F7]"
        )}
        onClick={() => document.getElementById("upload-input")?.click()}
      >
        <Upload size={32} className="mx-auto mb-3 text-[#606060]" />
        <p className="font-medium text-black">Arraste e solte as fotos da matrícula aqui</p>
        <p className="text-sm text-[#606060] mt-1">ou clique para selecionar</p>
        <p className="text-xs text-[#A0A0A0] mt-2">JPG, PNG, WebP — até {MAX_TAMANHO_MB}MB por arquivo — máx. {MAX_ARQUIVOS} páginas</p>
        <input
          id="upload-input"
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleInput}
        />
      </div>

      {/* Lista de arquivos */}
      {arquivos.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-black">{arquivos.length} arquivo(s) carregado(s)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {arquivos.map((a, idx) => (
              <div key={idx} className="relative group rounded-lg border border-black/10 overflow-hidden bg-[#F7F7F7]">
                {a.tipo.startsWith("image/") ? (
                  <img src={a.dataUrl} alt={a.nome} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 flex items-center justify-center">
                    <FileImage size={32} className="text-[#606060]" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-medium text-black truncate">{a.nome}</p>
                  <p className="text-[11px] text-[#A0A0A0]">{formatBytes(a.tamanho)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); remover(idx); }}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {erro && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{erro}</p>
        </div>
      )}

      {progresso && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <Loader2 size={16} className="text-[#FF7924] animate-spin shrink-0" />
          <p className="text-sm text-[#FF7924] font-medium">{progresso}</p>
        </div>
      )}

      <button
        onClick={analisar}
        disabled={!arquivos.length || analisando}
        className={cn(
          "w-full h-11 rounded-xl font-semibold text-sm transition-colors",
          arquivos.length && !analisando
            ? "bg-[#FF7924] text-white hover:bg-orange-600"
            : "bg-[#F7F7F7] text-[#A0A0A0] cursor-not-allowed"
        )}
      >
        {analisando ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Analisando...
          </span>
        ) : (
          `Analisar ${arquivos.length ? `${arquivos.length} imagem(ns)` : ""} com IA`
        )}
      </button>
    </div>
  );
}
