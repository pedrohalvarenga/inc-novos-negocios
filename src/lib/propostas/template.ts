import type { FormaPagamento } from "@prisma/client";
import { FORMA_PAGAMENTO_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate, formatPercent } from "@/lib/formatters";

export interface PropostaTemplateData {
  vendedor: {
    nomeRazaoSocial: string;
    cpfCnpj?: string | null;
    representanteLegal?: string | null;
    telefone?: string | null;
    email?: string | null;
  }[];
  terreno: {
    nome: string;
    logradouro: string;
    numero?: string | null;
    bairro: string;
    cidade: string;
    uf: string;
    cep?: string | null;
    areaTerreno: number;
    matricula?: string | null;
  };
  proposta: {
    versao: number;
    valorProposto?: number | null;
    formaPagamento?: FormaPagamento | null;
    prazo?: number | null;
    percentualPermuta?: number | null;
    condicoesEspeciais?: string | null;
    validade?: Date | string | null;
  };
  responsavel: {
    nome: string;
    email: string;
  };
  dataEmissao: Date;
}

export function gerarHtmlProposta(data: PropostaTemplateData): string {
  const {
    vendedor,
    terreno,
    proposta,
    responsavel,
    dataEmissao,
  } = data;

  const vendedoresStr = vendedor
    .map((v) => `${v.nomeRazaoSocial}${v.cpfCnpj ? ` (${v.cpfCnpj})` : ""}${v.representanteLegal ? `, rep. por ${v.representanteLegal}` : ""}`)
    .join("; ");

  const formaPgtoLabel = proposta.formaPagamento
    ? FORMA_PAGAMENTO_LABELS[proposta.formaPagamento]
    : "A definir";

  const enderecoCompleto = [terreno.logradouro, terreno.numero, terreno.bairro, `${terreno.cidade}/${terreno.uf}`, terreno.cep]
    .filter(Boolean)
    .join(", ");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Proposta de Aquisição — v${proposta.versao} — ${terreno.nome}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; background: #fff; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #F26522; padding-bottom: 16px; margin-bottom: 24px; }
    .logo-area h1 { font-size: 20px; font-weight: bold; color: #000; }
    .logo-area p { font-size: 11px; color: #606060; margin-top: 2px; }
    .proposta-info { text-align: right; }
    .proposta-info .numero { font-size: 14px; font-weight: bold; color: #F26522; }
    .proposta-info .data { font-size: 11px; color: #606060; margin-top: 2px; }
    h2 { font-size: 13px; font-weight: bold; color: #000; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .section { margin-bottom: 20px; }
    .row { display: flex; margin-bottom: 6px; }
    .label { width: 180px; font-size: 11px; color: #606060; flex-shrink: 0; }
    .value { font-size: 12px; font-weight: 500; color: #000; flex: 1; }
    .box { border: 1px solid #e5e5e5; border-radius: 6px; padding: 14px; background: #f9f9f9; }
    .condicoes { white-space: pre-wrap; line-height: 1.6; }
    .footer { margin-top: 40px; border-top: 1px solid #e5e5e5; padding-top: 16px; }
    .assinaturas { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 24px; }
    .assinatura-box { border-top: 1px solid #000; padding-top: 8px; text-align: center; }
    .disclaimer { font-size: 10px; color: #606060; margin-top: 20px; text-align: center; border: 1px solid #FFF0E8; background: #FFF8F5; padding: 8px; border-radius: 4px; }
    .validade-destaque { background: #FFF0E8; border: 1px solid #F26522; border-radius: 4px; padding: 8px 12px; margin-top: 12px; font-size: 11px; color: #c2410c; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-area">
      <h1>INC Empreendimentos</h1>
      <p>Novos Negócios</p>
    </div>
    <div class="proposta-info">
      <div class="numero">PROPOSTA — v${proposta.versao}</div>
      <div class="data">Emissão: ${formatDate(dataEmissao)}</div>
      ${proposta.validade ? `<div class="data">Válida até: ${formatDate(proposta.validade)}</div>` : ""}
    </div>
  </div>

  <div class="section">
    <h2>1. Identificação das Partes</h2>
    <div class="box">
      <div class="row"><span class="label">Compradora (INC)</span><span class="value">INC Empreendimentos — Novos Negócios</span></div>
      <div class="row"><span class="label">Representante INC</span><span class="value">${responsavel.nome} — ${responsavel.email}</span></div>
      <div class="row" style="margin-top:8px"><span class="label">Vendedor(es)</span><span class="value">${vendedoresStr || "A identificar"}</span></div>
    </div>
  </div>

  <div class="section">
    <h2>2. Objeto da Proposta</h2>
    <div class="box">
      <div class="row"><span class="label">Imóvel</span><span class="value">${terreno.nome}</span></div>
      <div class="row"><span class="label">Endereço</span><span class="value">${enderecoCompleto}</span></div>
      <div class="row"><span class="label">Área do Terreno</span><span class="value">${terreno.areaTerreno.toLocaleString("pt-BR")} m²</span></div>
      ${terreno.matricula ? `<div class="row"><span class="label">Matrícula</span><span class="value">${terreno.matricula}</span></div>` : ""}
    </div>
  </div>

  <div class="section">
    <h2>3. Proposta Comercial</h2>
    <div class="box">
      <div class="row"><span class="label">Valor Proposto</span><span class="value" style="font-size:14px;font-weight:bold;color:#F26522">${formatCurrency(proposta.valorProposto)}</span></div>
      <div class="row"><span class="label">Forma de Pagamento</span><span class="value">${formaPgtoLabel}</span></div>
      ${proposta.prazo ? `<div class="row"><span class="label">Prazo de Pagamento</span><span class="value">${proposta.prazo} meses</span></div>` : ""}
      ${proposta.percentualPermuta ? `<div class="row"><span class="label">Percentual de Permuta</span><span class="value">${formatPercent(proposta.percentualPermuta)}</span></div>` : ""}
    </div>
  </div>

  ${proposta.condicoesEspeciais ? `
  <div class="section">
    <h2>4. Condições Especiais e Observações</h2>
    <div class="box">
      <p class="condicoes">${proposta.condicoesEspeciais}</p>
    </div>
  </div>` : ""}

  <div class="section">
    <h2>${proposta.condicoesEspeciais ? "5" : "4"}. Disposições Gerais</h2>
    <div class="box">
      <p style="line-height:1.6">A presente proposta é formulada pela INC Empreendimentos no interesse de adquirir o imóvel descrito acima, sujeita às condições aqui estabelecidas. A aceitação desta proposta pelo(s) vendedor(es) implicará na obrigação de elaboração do instrumento contratual definitivo, observadas as condições suspensivas de aprovação de projeto e registro de incorporação junto ao Cartório de Registro de Imóveis competente.</p>
      <p style="line-height:1.6;margin-top:8px">Esta proposta não gera qualquer obrigação de contratação por parte da INC Empreendimentos antes da assinatura do instrumento definitivo.</p>
    </div>
  </div>

  ${proposta.validade ? `<div class="validade-destaque">⚠️ Esta proposta expira em ${formatDate(proposta.validade)}. Após esta data, os valores e condições aqui propostos perdem validade.</div>` : ""}

  <div class="footer">
    <div class="assinaturas">
      <div class="assinatura-box">
        <p style="font-weight:bold">INC Empreendimentos</p>
        <p style="font-size:11px;color:#606060;margin-top:4px">${responsavel.nome}</p>
      </div>
      <div class="assinatura-box">
        <p style="font-weight:bold">Vendedor(es)</p>
        <p style="font-size:11px;color:#606060;margin-top:4px">${vendedor[0]?.nomeRazaoSocial || "—"}</p>
      </div>
    </div>
    <div class="disclaimer">
      Proposta de aquisição emitida pela INC Empreendimentos — Novos Negócios. Documento gerado em ${formatDate(dataEmissao)}.
    </div>
  </div>
</body>
</html>`;
}
