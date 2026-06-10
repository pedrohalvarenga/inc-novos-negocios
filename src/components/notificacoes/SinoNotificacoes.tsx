"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";

export default function SinoNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function carregar() {
    const ns = await fetch("/api/notificacoes").then((r) => r.json()).catch(() => []);
    setNotificacoes(Array.isArray(ns) ? ns : []);
  }

  useEffect(() => { carregar(); }, []);

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, []);

  async function marcarLida(id: string) {
    await fetch(`/api/notificacoes/${id}/ler`, { method: "POST" });
    setNotificacoes((ns) => ns.map((n) => n.id === id ? { ...n, lida: true } : n));
  }

  async function marcarTodasLidas() {
    const naoLidas = notificacoes.filter((n) => !n.lida);
    await Promise.all(naoLidas.map((n) => fetch(`/api/notificacoes/${n.id}/ler`, { method: "POST" })));
    setNotificacoes((ns) => ns.map((n) => ({ ...n, lida: true })));
  }

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setAberto((v) => !v); if (!aberto) carregar(); }}
        className="relative p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
      >
        <Bell size={18} />
        {naoLidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF7924] rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-black/10 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/8">
            <span className="text-sm font-semibold text-black">Notificações</span>
            {naoLidas > 0 && (
              <button onClick={marcarTodasLidas} className="text-xs text-[#FF7924] hover:underline">
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-black/4">
            {notificacoes.length === 0 && (
              <p className="text-sm text-[#A0A0A0] p-6 text-center">Nenhuma notificação</p>
            )}
            {notificacoes.map((n) => (
              <button key={n.id} onClick={() => marcarLida(n.id)}
                className={`w-full text-left px-4 py-3 hover:bg-[#FAFAFA] transition-colors ${n.lida ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-2">
                  {!n.lida && <span className="w-2 h-2 rounded-full bg-[#FF7924] shrink-0 mt-1" />}
                  <div className={n.lida ? "pl-4" : ""}>
                    <p className="text-xs font-semibold text-black leading-tight">{n.titulo}</p>
                    <p className="text-xs text-[#606060] mt-0.5 leading-snug">{n.mensagem}</p>
                    <p className="text-[10px] text-[#A0A0A0] mt-1">{formatDateTime(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
