import type { ClausulasContrato } from "./template";
import { CLAUSULAS_ORDEM } from "./template";
import { formatDate } from "@/lib/formatters";

export function gerarHtmlContrato(params: {
  terreno: { nome: string; cidade: string; uf: string };
  contrato: { versao: number; status: string; dataAssinatura?: Date | string | null; observacoes?: string | null };
  clausulas: ClausulasContrato;
  dataEmissao: Date;
}): string {
  const { terreno, contrato, clausulas, dataEmissao } = params;

  const clausulasHtml = CLAUSULAS_ORDEM
    .filter((key) => clausulas[key])
    .map((key) => {
      const c = clausulas[key];
      return `
      <div class="clausula">
        <h3>${c.titulo}</h3>
        <div class="clausula-texto">${c.conteudo.replace(/\n/g, "<br/>")}</div>
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Contrato — ${terreno.nome}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; background: #fff; padding: 48px; line-height: 1.6; }
    .header { text-align: center; border-bottom: 2px solid #F26522; padding-bottom: 20px; margin-bottom: 32px; }
    .header h1 { font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .header .subtitulo { font-size: 13px; color: #606060; margin-top: 4px; }
    .header .versao { font-size: 11px; color: #F26522; font-weight: bold; margin-top: 8px; }
    .header .emissao { font-size: 11px; color: #606060; }
    .clausula { margin-bottom: 24px; page-break-inside: avoid; }
    .clausula h3 { font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e5e5e5; padding-bottom: 4px; }
    .clausula-texto { font-size: 11px; line-height: 1.7; text-align: justify; }
    .assinaturas { margin-top: 48px; border-top: 1px solid #e5e5e5; padding-top: 24px; }
    .assinaturas h3 { font-size: 12px; font-weight: bold; margin-bottom: 20px; }
    .assinatura-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
    .assinatura-box { margin-bottom: 16px; }
    .assinatura-linha { border-bottom: 1px solid #000; margin-bottom: 6px; height: 40px; }
    .assinatura-nome { font-size: 11px; text-align: center; }
    .testemunhas { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 24px; }
    .disclaimer { font-size: 10px; color: #606060; text-align: center; margin-top: 20px; }
    @media print { body { padding: 20px; } .clausula { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Instrumento Particular de Promessa de Compra e Venda de Imóvel</h1>
    <div class="subtitulo">${terreno.nome} — ${terreno.cidade}/${terreno.uf}</div>
    <div class="versao">Versão ${contrato.versao}${contrato.status === "ASSINADO" ? " — ASSINADO" : " — MINUTA"}</div>
    <div class="emissao">Gerado em ${formatDate(dataEmissao)}</div>
  </div>

  ${clausulasHtml}

  <div class="assinaturas">
    <h3>Assinaturas</h3>
    <div class="assinatura-grid">
      <div class="assinatura-box">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">INC Empreendimentos (Compradora)</div>
      </div>
      <div class="assinatura-box">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Vendedor(a)</div>
      </div>
    </div>
    <div class="testemunhas">
      <div class="assinatura-box">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Testemunha 1 — CPF: _______________</div>
      </div>
      <div class="assinatura-box">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Testemunha 2 — CPF: _______________</div>
      </div>
    </div>
  </div>

  <div class="disclaimer">
    Documento gerado pelo Sistema de Gestão de Novos Negócios — INC Empreendimentos em ${formatDate(dataEmissao)}.
    ${contrato.status !== "ASSINADO" ? "⚠️ MINUTA — Sujeito a revisão jurídica antes da assinatura." : ""}
  </div>
</body>
</html>`;
}
