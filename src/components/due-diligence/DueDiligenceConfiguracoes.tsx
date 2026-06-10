"use client";

import { Settings, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Link from "next/link";

interface Provider {
  nome: string;
  descricao: string;
  envVar: string;
  tipo: "CPF" | "CNPJ" | "AMBOS";
  gratis: boolean;
  documentacao?: string;
}

const PROVIDERS: Provider[] = [
  {
    nome: "Receita Federal (BrasilAPI)",
    descricao: "Consulta gratuita de CNPJ na base da Receita Federal via BrasilAPI. Não requer credenciais.",
    envVar: "—",
    tipo: "CNPJ",
    gratis: true,
    documentacao: "https://brasilapi.com.br/docs",
  },
  {
    nome: "BigDataCorp",
    descricao: "Consulta completa de CPF e CNPJ com dados de crédito, processos judiciais e protestos.",
    envVar: "BIGDATACORP_API_KEY",
    tipo: "AMBOS",
    gratis: false,
    documentacao: "https://developers.bigdatacorp.com.br",
  },
  {
    nome: "Serpro / Datavalid",
    descricao: "Validação de dados cadastrais de CPF/CNPJ diretamente na base da Receita Federal.",
    envVar: "SERPRO_API_KEY",
    tipo: "AMBOS",
    gratis: false,
    documentacao: "https://servicos.serpro.gov.br/datavalid",
  },
  {
    nome: "Escavador",
    descricao: "Busca de processos judiciais, publicações em diários oficiais e informações societárias.",
    envVar: "ESCAVADOR_API_KEY",
    tipo: "AMBOS",
    gratis: false,
    documentacao: "https://api.escavador.com",
  },
];

export default function DueDiligenceConfiguracoes() {
  return (
    <div className="p-8">
      <div className="mb-4">
        <Link href="/due-diligence" className="text-sm text-[#606060] hover:text-black transition-colors">← Voltar</Link>
      </div>
      <PageHeader
        title="Configurações — Due Diligence"
        description="Configure os provedores de consulta de CPF e CNPJ"
      />

      <div className="space-y-3 mt-6">
        {PROVIDERS.map((p) => {
          const ativo = p.gratis; // apenas Receita Federal está ativo sem config
          return (
            <div key={p.nome} className="rounded-xl border border-black/8 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-black">{p.nome}</span>
                    {ativo ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold border border-green-200">
                        <CheckCircle size={10} /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold border border-gray-200">
                        <XCircle size={10} /> Não configurado
                      </span>
                    )}
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F7F7F7] border border-black/10 text-[#606060]">{p.tipo}</span>
                    {p.gratis && <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 border border-orange-200 text-[#FF7924] font-semibold">Gratuito</span>}
                  </div>
                  <p className="text-sm text-[#606060]">{p.descricao}</p>
                  {!p.gratis && (
                    <p className="text-xs text-[#A0A0A0] mt-1">
                      Para ativar: configure <code className="bg-[#F7F7F7] px-1.5 py-0.5 rounded font-mono">{p.envVar}</code> no arquivo <code className="bg-[#F7F7F7] px-1.5 py-0.5 rounded font-mono">.env</code>
                    </p>
                  )}
                </div>
                {p.documentacao && (
                  <a
                    href={p.documentacao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 h-8 px-3 rounded-lg border border-black/20 text-xs font-medium text-black hover:bg-[#F7F7F7] transition-colors shrink-0"
                  >
                    <ExternalLink size={11} /> Docs
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-[#F7F7F7] rounded-xl">
        <p className="text-xs text-[#606060]">
          <strong>Modo Manual:</strong> Sempre disponível. Permite registrar os itens do checklist manualmente com upload de certidões e indicação da fonte.
        </p>
      </div>
    </div>
  );
}
