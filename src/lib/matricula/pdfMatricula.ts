import type { DadosMatricula } from "./analisarMatricula";
import { formatDate } from "@/lib/formatters";

const RISCO_LABEL: Record<string, string> = {
  IMPEDITIVO: "IMPEDITIVO",
  ALTO: "ALTO",
  MEDIO: "MÉDIO",
  BAIXO: "BAIXO",
};

const RISCO_COR: Record<string, string> = {
  IMPEDITIVO: "#7f1d1d",
  ALTO: "#dc2626",
  MEDIO: "#d97706",
  BAIXO: "#16a34a",
};

export function gerarHtmlRelatorioMatricula(params: {
  terreno: { nome: string; cidade: string; uf: string };
  matricula: { numero?: string | null; cartorio?: string | null; comarca?: string | null; createdAt: Date | string };
  dados: DadosMatricula;
  dataEmissao: Date;
}): string {
  const { terreno, matricula, dados, dataEmissao } = params;

  const onusHtml = dados.onus?.length
    ? dados.onus.map((o) => `
      <tr>
        <td style="padding:8px;border:1px solid #e5e5e5;">${o.tipo}</td>
        <td style="padding:8px;border:1px solid #e5e5e5;">${o.descricao}</td>
        <td style="padding:8px;border:1px solid #e5e5e5;text-align:center;">
          <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-weight:bold;font-size:11px;background:${RISCO_COR[o.risco] ?? "#606060"};color:#fff;">
            ${RISCO_LABEL[o.risco] ?? o.risco}
          </span>
        </td>
        <td style="padding:8px;border:1px solid #e5e5e5;">${o.livroFolha ?? "—"}</td>
      </tr>`).join("")
    : `<tr><td colspan="4" style="padding:12px;text-align:center;color:#606060;border:1px solid #e5e5e5;">Nenhum ônus identificado</td></tr>`;

  const proprietariosHtml = dados.proprietariosAtuais?.map((p) =>
    `<li>${p.nome}${p.cpfCnpj ? ` — ${p.cpfCnpj}` : ""}</li>`
  ).join("") ?? "<li>Não identificado</li>";

  const dominialHtml = dados.cadeiaDominial?.map((d) =>
    `<li>${d.data ? `<strong>${d.data}:</strong> ` : ""}${d.descricao}</li>`
  ).join("") ?? "<li>—</li>";

  const riscoGeral = dados.riscoConsolidado ?? "BAIXO";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Análise de Matrícula — ${terreno.nome}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Arial,sans-serif; font-size:12px; color:#000; background:#fff; padding:48px; line-height:1.6; }
    .header { border-bottom:3px solid #FF7924; padding-bottom:20px; margin-bottom:32px; display:flex; justify-content:space-between; align-items:flex-start; }
    .header-left h1 { font-size:16px; font-weight:bold; text-transform:uppercase; letter-spacing:1px; }
    .header-left .sub { font-size:13px; color:#606060; margin-top:4px; }
    .header-left .emissao { font-size:11px; color:#606060; margin-top:2px; }
    .risco-badge { display:inline-block; padding:8px 18px; border-radius:8px; font-weight:bold; font-size:14px; color:#fff; background:${RISCO_COR[riscoGeral] ?? "#606060"}; }
    .section { margin-bottom:24px; }
    .section h2 { font-size:13px; font-weight:bold; border-bottom:1px solid #e5e5e5; padding-bottom:4px; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px; }
    .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .field { margin-bottom:8px; }
    .field .label { font-size:10px; color:#606060; text-transform:uppercase; letter-spacing:0.5px; }
    .field .value { font-size:12px; font-weight:500; }
    table { width:100%; border-collapse:collapse; font-size:11px; }
    th { background:#f7f7f7; padding:8px; border:1px solid #e5e5e5; text-align:left; font-weight:bold; text-transform:uppercase; font-size:10px; }
    ul { padding-left:18px; }
    li { margin-bottom:4px; font-size:11px; }
    .disclaimer { margin-top:32px; padding:12px 16px; background:#fff3cd; border:1px solid #ffc107; border-radius:6px; font-size:11px; color:#664d03; }
    .footer { margin-top:24px; padding-top:12px; border-top:1px solid #e5e5e5; font-size:10px; color:#606060; text-align:center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>Relatório de Análise de Matrícula</h1>
      <div class="sub">${terreno.nome} — ${terreno.cidade}/${terreno.uf}</div>
      <div class="emissao">Emitido em ${formatDate(dataEmissao)}</div>
    </div>
    <div>
      <div style="font-size:10px;color:#606060;margin-bottom:4px;text-align:center;">RISCO CONSOLIDADO</div>
      <div class="risco-badge">${RISCO_LABEL[riscoGeral] ?? riscoGeral}</div>
    </div>
  </div>

  <div class="section">
    <h2>Identificação da Matrícula</h2>
    <div class="grid-2">
      <div class="field"><div class="label">Número</div><div class="value">${dados.numero ?? matricula.numero ?? "—"}</div></div>
      <div class="field"><div class="label">Cartório / Comarca</div><div class="value">${dados.cartorioComarca ?? ([matricula.cartorio, matricula.comarca].filter(Boolean).join(" — ") || "—")}</div></div>
      <div class="field" style="grid-column:1/-1"><div class="label">Descrição do Imóvel</div><div class="value">${dados.descricaoImovel ?? "—"}</div></div>
      <div class="field"><div class="label">Área Registrada</div><div class="value">${dados.areaRegistrada ? `${dados.areaRegistrada.toLocaleString("pt-BR")} m²` : "—"}</div></div>
      <div class="field"><div class="label">Data da Análise</div><div class="value">${formatDate(matricula.createdAt)}</div></div>
    </div>
  </div>

  <div class="section">
    <h2>Proprietários Atuais</h2>
    <ul>${proprietariosHtml}</ul>
  </div>

  <div class="section">
    <h2>Cadeia Dominial (Últimas Transmissões)</h2>
    <ul>${dominialHtml}</ul>
  </div>

  <div class="section">
    <h2>Ônus e Gravames</h2>
    <table>
      <thead>
        <tr>
          <th>Tipo</th><th>Descrição</th><th style="text-align:center">Risco</th><th>Livro/Folha</th>
        </tr>
      </thead>
      <tbody>${onusHtml}</tbody>
    </table>
  </div>

  ${dados.observacoes ? `<div class="section"><h2>Observações</h2><p style="font-size:11px;">${dados.observacoes}</p></div>` : ""}

  <div class="disclaimer">
    ⚠️ <strong>Aviso importante:</strong> Esta análise foi gerada por Inteligência Artificial como ferramenta de apoio à decisão. Não substitui a análise jurídica por advogado habilitado. Sempre verifique a certidão de inteiro teor atualizada junto ao Cartório de Registro de Imóveis competente.
  </div>

  <div class="footer">
    Relatório gerado pelo Sistema de Gestão de Novos Negócios — INC Empreendimentos em ${formatDate(dataEmissao)}
  </div>
</body>
</html>`;
}
