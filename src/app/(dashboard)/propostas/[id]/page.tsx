"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Printer } from "lucide-react";
import PropostaStatusBadge from "@/components/propostas/PropostaStatusBadge";
import { formatCurrency, formatDate, formatPercent } from "@/lib/formatters";
import { FORMA_PAGAMENTO_LABELS } from "@/lib/constants";
import { gerarHtmlProposta } from "@/lib/propostas/template";

export default function PropostaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [proposta, setProposta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState("");

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      fetch(`/api/propostas/${p.id}`)
        .then((r) => r.json())
        .then((data) => { setProposta(data); setLoading(false); });
    });
  }, [params]);

  function imprimir() {
    if (!proposta) return;
    const html = gerarHtmlProposta({
      vendedor: (proposta.terreno?.proprietarios ?? []).map((tp: any) => ({
        nomeRazaoSocial: tp.proprietario.nomeRazaoSocial,
        cpfCnpj: tp.proprietario.cpfCnpj,
        representanteLegal: tp.proprietario.representanteLegal,
      })),
      terreno: {
        nome: proposta.terreno?.nome ?? "",
        logradouro: proposta.terreno?.logradouro ?? "",
        numero: proposta.terreno?.numero,
        bairro: proposta.terreno?.bairro ?? "",
        cidade: proposta.terreno?.cidade ?? "",
        uf: proposta.terreno?.uf ?? "",
        cep: proposta.terreno?.cep,
        areaTerreno: proposta.terreno?.areaTerreno ?? 0,
      },
      proposta: {
        versao: proposta.versao,
        valorProposto: proposta.valorProposto,
        formaPagamento: proposta.formaPagamento,
        prazo: proposta.prazo,
        percentualPermuta: proposta.percentualPermuta,
        condicoesEspeciais: proposta.condicoesEspeciais,
        validade: proposta.validade,
      },
      responsavel: proposta.terreno?.responsavel ?? { nome: "Equipe INC", email: "novosnegocios@inc.com.br" },
      dataEmissao: new Date(),
    });
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-[#606060]" />
      </div>
    );
  }

  if (!proposta || proposta.error) {
    return <div className="p-8"><p className="text-sm text-[#606060]">Proposta não encontrada.</p></div>;
  }

  function Row({ label, value }: { label: string; value?: string | null }) {
    return (
      <div className="flex items-start justify-between py-2.5 border-b border-black/6 last:border-0">
        <span className="text-sm text-[#606060] w-44 shrink-0">{label}</span>
        <span className="text-sm font-medium text-black text-right">{value ?? "—"}</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/propostas" className="flex items-center gap-1 text-sm text-[#606060] hover:text-black mb-6">
        <ChevronLeft size={15} /> Propostas
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-black">Proposta v{proposta.versao}</h1>
            <PropostaStatusBadge status={proposta.status} />
          </div>
          <p className="text-sm text-[#606060] mt-1">
            {proposta.terreno?.nome} — {proposta.terreno?.cidade}/{proposta.terreno?.uf}
          </p>
        </div>
        <button
          onClick={imprimir}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-black/20 text-sm font-medium text-[#606060] hover:bg-[#F7F7F7] transition-colors"
        >
          <Printer size={14} />
          Imprimir / PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-black/8 bg-white p-6">
          <h3 className="text-sm font-semibold text-black mb-4">Dados Comerciais</h3>
          <Row label="Valor Proposto" value={formatCurrency(proposta.valorProposto)} />
          <Row label="Forma de Pagamento" value={proposta.formaPagamento ? FORMA_PAGAMENTO_LABELS[proposta.formaPagamento as keyof typeof FORMA_PAGAMENTO_LABELS] : null} />
          <Row label="Prazo" value={proposta.prazo ? `${proposta.prazo} meses` : null} />
          <Row label="% Permuta" value={proposta.percentualPermuta ? formatPercent(proposta.percentualPermuta) : null} />
          <Row label="Validade" value={formatDate(proposta.validade)} />
          <Row label="Data de Envio" value={formatDate(proposta.dataEnvio)} />
        </div>

        <div className="rounded-xl border border-black/8 bg-white p-6">
          <h3 className="text-sm font-semibold text-black mb-4">Terreno & Proprietários</h3>
          <Row label="Terreno" value={proposta.terreno?.nome} />
          <Row label="Cidade/UF" value={`${proposta.terreno?.cidade}/${proposta.terreno?.uf}`} />
          {(proposta.terreno?.proprietarios ?? []).map((tp: any) => (
            <Row key={tp.id} label="Proprietário" value={`${tp.proprietario.nomeRazaoSocial}${tp.proprietario.cpfCnpj ? ` — ${tp.proprietario.cpfCnpj}` : ""}`} />
          ))}
          <Row label="Responsável INC" value={proposta.terreno?.responsavel?.nome} />
          <Row label="Criado por" value={proposta.criador?.nome} />
        </div>
      </div>

      {proposta.condicoesEspeciais && (
        <div className="rounded-xl border border-black/8 bg-white p-6 mt-6">
          <h3 className="text-sm font-semibold text-black mb-3">Condições Especiais</h3>
          <p className="text-sm text-black whitespace-pre-wrap leading-relaxed">{proposta.condicoesEspeciais}</p>
        </div>
      )}

      {proposta.motivoRecusa && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 mt-6">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Motivo da Recusa</h3>
          <p className="text-sm text-red-700">{proposta.motivoRecusa}</p>
        </div>
      )}

      <div className="mt-6">
        <Link
          href={`/terrenos/${proposta.terrenoId}`}
          className="text-sm text-[#606060] hover:text-black transition-colors"
        >
          ← Ver terreno completo
        </Link>
      </div>
    </div>
  );
}
