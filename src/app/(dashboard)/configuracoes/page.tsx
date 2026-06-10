import PageHeader from "@/components/common/PageHeader";
import Link from "next/link";
import { Lock, ExternalLink } from "lucide-react";

const FUTURAS = [
  { titulo: "Due Diligence Automatizado", desc: "Consulta automática de CPF/CNPJ em bureaus externos" },
  { titulo: "Assinatura Digital", desc: "Integração com plataformas de assinatura de contratos" },
];

export default function ConfiguracoesPage() {
  return (
    <div className="p-8 max-w-3xl space-y-8">
      <PageHeader
        title="Configurações"
        description="Parâmetros do sistema — acesso restrito a Administradores"
      />

      {/* Score */}
      <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-black/6">
          <h2 className="text-sm font-semibold text-black">Pesos do Score de Negociação</h2>
          <p className="text-xs text-[#606060] mt-0.5">Soma deve totalizar 100. Configurável em breve.</p>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {[
            { label: "% Terreno/VGV", valor: 40, desc: "Quanto menor, melhor" },
            { label: "Forma de Pagamento", valor: 25, desc: "Permuta pontua mais" },
            { label: "Prazo de Pagamento", valor: 20, desc: "Quanto maior, melhor" },
            { label: "Risco Matrícula/DD", valor: 15, desc: "Neutro nesta fase" },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-lg bg-[#F7F7F7]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-black">{item.label}</p>
                <span className="text-lg font-bold text-[#F26522]">{item.valor}%</span>
              </div>
              <p className="text-xs text-[#606060]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Faixas VGV */}
      <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-black/6">
          <h2 className="text-sm font-semibold text-black">Faixas de Referência — % Terreno/VGV</h2>
          <p className="text-xs text-[#606060] mt-0.5">Configurável em breve.</p>
        </div>
        <div className="p-6 flex gap-4">
          {[
            { label: "Verde (excelente)", cor: "#16a34a", valor: "até 10%" },
            { label: "Amarelo (atenção)", cor: "#ca8a04", valor: "10% – 15%" },
            { label: "Vermelho (alto)", cor: "#dc2626", valor: "acima de 15%" },
          ].map((f) => (
            <div key={f.label} className="flex-1 p-4 rounded-lg border" style={{ borderColor: f.cor + "30", backgroundColor: f.cor + "08" }}>
              <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: f.cor }} />
              <p className="text-xs font-semibold" style={{ color: f.cor }}>{f.label}</p>
              <p className="text-sm font-bold text-black mt-0.5">{f.valor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Marca */}
      <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-black/6">
          <h2 className="text-sm font-semibold text-black">Identidade Visual</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: "#F26522" }} />
            <div>
              <p className="text-sm font-semibold text-black">Cor Laranja INC</p>
              <p className="text-xs text-[#606060] font-mono">#F26522</p>
            </div>
          </div>
          <p className="text-xs text-[#A0A0A0]">
            Para alterar o logo, substitua o arquivo em <code className="bg-[#F7F7F7] px-1 rounded">/public/brand/logo.svg</code>.
            Upload via painel estará disponível em breve.
          </p>
        </div>
      </div>

      {/* Integrações */}
      <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-black/6">
          <h2 className="text-sm font-semibold text-black">Integrações</h2>
        </div>
        <div className="divide-y divide-black/4">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Zenkit</p>
              <p className="text-xs text-[#606060]">Importe e sincronize terrenos automaticamente</p>
            </div>
            <Link href="/configuracoes/zenkit"
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-black/15 text-xs font-medium text-black hover:bg-[#F7F7F7]">
              <ExternalLink size={12} /> Configurar
            </Link>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">E-mail (SMTP)</p>
              <p className="text-xs text-[#606060]">Configure as variáveis SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS no ambiente do servidor</p>
            </div>
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Disponível</span>
          </div>
        </div>
      </div>

      {/* Funcionalidades futuras */}
      <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-black/6">
          <h2 className="text-sm font-semibold text-black">Próximas Funcionalidades</h2>
        </div>
        <div className="divide-y divide-black/4">
          {FUTURAS.map((f) => (
            <div key={f.titulo} className="px-6 py-4 flex items-center gap-4">
              <Lock size={16} className="text-[#A0A0A0] shrink-0" />
              <div>
                <p className="text-sm font-medium text-black">{f.titulo}</p>
                <p className="text-xs text-[#606060]">{f.desc}</p>
              </div>
              <span className="ml-auto text-xs bg-[#F7F7F7] text-[#606060] px-2 py-0.5 rounded-full whitespace-nowrap">
                Em breve
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
