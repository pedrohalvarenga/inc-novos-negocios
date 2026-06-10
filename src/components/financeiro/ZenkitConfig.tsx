"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, RefreshCw, AlertCircle } from "lucide-react";

const CAMPOS_TERRENO = [
  { value: "nome", label: "Nome" },
  { value: "logradouro", label: "Logradouro" },
  { value: "numero", label: "Número" },
  { value: "bairro", label: "Bairro" },
  { value: "cidade", label: "Cidade" },
  { value: "uf", label: "UF" },
  { value: "cep", label: "CEP" },
  { value: "areaTerreno", label: "Área do Terreno" },
  { value: "valorPedido", label: "Valor Pedido" },
  { value: "zoneamento", label: "Zoneamento" },
];

export default function ZenkitConfig() {
  const [testeStatus, setTesteStatus] = useState<"idle" | "ok" | "erro">("idle");
  const [testeErro, setTesteErro] = useState("");
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [listaSelecionada, setListaSelecionada] = useState("");
  const [camposZenkit, setCamposZenkit] = useState<any[]>([]);
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [salvado, setSalvado] = useState(false);

  const [sincronizando, setSincronizando] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [resultadoSync, setResultadoSync] = useState<any>(null);

  useEffect(() => {
    fetch("/api/zenkit/mapeamento").then((r) => r.json()).then((cfg) => {
      if (cfg?.listId) setListaSelecionada(cfg.listId);
      if (cfg?.campos) setMapeamento(cfg.campos);
    });
    carregarLogs();
  }, []);

  async function testarConexao() {
    setTesteStatus("idle");
    const res = await fetch("/api/zenkit/testar").then((r) => r.json());
    if (res.ok) {
      setTesteStatus("ok");
      const todasListas: any[] = [];
      for (const ws of (res.workspaces ?? [])) {
        for (const lista of (ws.lists ?? [])) {
          todasListas.push({ id: lista.id, nome: lista.name, workspace: ws.name });
        }
      }
      setWorkspaces(todasListas);
    } else {
      setTesteStatus("erro");
      setTesteErro(res.erro ?? "Erro desconhecido");
    }
  }

  async function carregarCampos(listId: string) {
    setListaSelecionada(listId);
    if (!listId) return;
    const campos = await fetch(`/api/zenkit/campos/${listId}`).then((r) => r.json());
    setCamposZenkit(Array.isArray(campos) ? campos : []);
  }

  async function salvarMapeamento() {
    setSalvando(true);
    await fetch("/api/zenkit/mapeamento", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId: listaSelecionada, campos: mapeamento }),
    });
    setSalvando(false);
    setSalvado(true);
    setTimeout(() => setSalvado(false), 2000);
  }

  async function sincronizarAgora() {
    setSincronizando(true);
    setResultadoSync(null);
    const res = await fetch("/api/zenkit/sincronizar", { method: "POST" }).then((r) => r.json());
    setResultadoSync(res);
    setSincronizando(false);
    carregarLogs();
  }

  async function carregarLogs() {
    const ls = await fetch("/api/zenkit/logs").then((r) => r.json()).catch(() => []);
    setLogs(Array.isArray(ls) ? ls : []);
  }

  return (
    <div className="space-y-6">
      {/* Conexão */}
      <div className="rounded-xl border border-black/8 bg-white p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-black">Conexão com Zenkit</h2>
          <p className="text-xs text-[#606060] mt-0.5">Configure <code className="bg-[#F7F7F7] px-1 rounded">ZENKIT_API_KEY</code> nas variáveis de ambiente do servidor.</p>
        </div>
        <button onClick={testarConexao}
          className="flex items-center gap-2 h-9 px-4 rounded-lg border border-black/15 text-sm font-medium hover:bg-[#F7F7F7]">
          <RefreshCw size={14} /> Testar conexão
        </button>
        {testeStatus === "ok" && (
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle size={16} /> Conexão bem-sucedida!
          </div>
        )}
        {testeStatus === "erro" && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <XCircle size={16} /> {testeErro}
          </div>
        )}
      </div>

      {/* Mapeamento */}
      {workspaces.length > 0 && (
        <div className="rounded-xl border border-black/8 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-black">Lista e Mapeamento de Campos</h2>
          <div>
            <label className="text-xs font-medium text-[#606060] block mb-1">Lista do Zenkit</label>
            <select value={listaSelecionada} onChange={(e) => carregarCampos(e.target.value)}
              className="w-full h-9 rounded-lg border border-black/15 px-3 text-sm bg-white">
              <option value="">Selecione uma lista…</option>
              {workspaces.map((l) => (
                <option key={l.id} value={l.id}>{l.workspace} / {l.nome}</option>
              ))}
            </select>
          </div>

          {camposZenkit.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-[#606060]">Mapeamento: campo do Zenkit → campo do sistema</p>
              {CAMPOS_TERRENO.map((ct) => (
                <div key={ct.value} className="flex items-center gap-3">
                  <span className="text-sm text-black w-36 shrink-0">{ct.label}</span>
                  <span className="text-[#606060] text-sm">←</span>
                  <select value={mapeamento[ct.value] ?? ""} onChange={(e) => setMapeamento((m) => ({ ...m, [ct.value]: e.target.value }))}
                    className="flex-1 h-9 rounded-lg border border-black/15 px-3 text-sm bg-white">
                    <option value="">Não mapear</option>
                    {camposZenkit.map((c: any) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              ))}
              <button onClick={salvarMapeamento} disabled={salvando}
                className="h-9 px-4 rounded-lg bg-black text-white text-sm font-medium hover:bg-[#222] disabled:opacity-50">
                {salvando ? "Salvando…" : salvado ? "Salvo!" : "Salvar mapeamento"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sincronização */}
      <div className="rounded-xl border border-black/8 bg-white p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-black">Sincronização</h2>
            <p className="text-xs text-[#606060] mt-0.5">Importa terrenos do Zenkit. Itens já importados são atualizados.</p>
          </div>
          <button onClick={sincronizarAgora} disabled={sincronizando}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#FF7924] text-white text-sm font-medium hover:bg-[#e06a1e] disabled:opacity-50">
            <RefreshCw size={14} className={sincronizando ? "animate-spin" : ""} />
            {sincronizando ? "Sincronizando…" : "Sincronizar agora"}
          </button>
        </div>

        {resultadoSync && (
          <div className="p-4 bg-[#F7F7F7] rounded-lg text-sm space-y-1">
            <p><span className="font-medium">Criados:</span> {resultadoSync.criados}</p>
            <p><span className="font-medium">Atualizados:</span> {resultadoSync.atualizados}</p>
            <p><span className="font-medium">Erros:</span> {resultadoSync.erros}</p>
            {resultadoSync.log?.length > 0 && (
              <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
                {resultadoSync.log.map((entry: any, i: number) => (
                  <div key={i} className={`flex gap-2 text-xs ${entry.tipo === "erro" ? "text-red-600" : entry.tipo === "aviso" ? "text-yellow-700" : "text-[#606060]"}`}>
                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                    {entry.mensagem}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Histórico de syncs */}
        {logs.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[#606060] mb-2">Histórico recente</p>
            <div className="space-y-1">
              {logs.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center justify-between text-xs py-1.5 border-b border-black/4">
                  <span className="text-[#606060]">{new Date(l.iniciado).toLocaleString("pt-BR")}</span>
                  <div className="flex gap-3 text-[#606060]">
                    <span className="text-green-700">+{l.criados}</span>
                    <span className="text-blue-700">↺{l.atualizados}</span>
                    {l.erros > 0 && <span className="text-red-600">✕{l.erros}</span>}
                  </div>
                  <span className={`font-medium ${l.status === "CONCLUIDO" ? "text-green-700" : "text-yellow-700"}`}>{l.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
