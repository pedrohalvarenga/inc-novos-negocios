export function gerarHtmlRelatorioFinanceiro(terreno: any, lancamentos: any[]): string {
  const total = lancamentos.reduce((s, l) => s + l.valor, 0);
  const pago = lancamentos.filter((l) => l.status === "PAGO").reduce((s, l) => s + l.valor, 0);
  const aPagar = lancamentos.filter((l) => l.status === "A_PAGAR").reduce((s, l) => s + l.valor, 0);
  const atrasado = lancamentos.filter((l) => l.status === "ATRASADO").reduce((s, l) => s + l.valor, 0);

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const rows = lancamentos
    .map(
      (l) => `
      <tr>
        <td>${l.tipo}</td>
        <td>${l.descricao ?? "—"}</td>
        <td>${fmt(l.valor)}</td>
        <td>${l.vencimento ? new Date(l.vencimento).toLocaleDateString("pt-BR") : "—"}</td>
        <td class="status-${l.status.toLowerCase()}">${l.status}</td>
        <td>${l.dataPagamento ? new Date(l.dataPagamento).toLocaleDateString("pt-BR") : "—"}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Relatório Financeiro — ${terreno.nome}</title>
<style>
  body { font-family: Arial, sans-serif; color: #000; padding: 32px; font-size: 12px; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  .sub { color: #606060; margin-bottom: 24px; font-size: 12px; }
  .kpis { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px; }
  .kpi { border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px; }
  .kpi label { display: block; font-size: 10px; color: #606060; margin-bottom: 4px; }
  .kpi strong { font-size: 15px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #000; color: #fff; text-align: left; padding: 8px; font-size: 11px; }
  td { padding: 7px 8px; border-bottom: 1px solid #f0f0f0; font-size: 11px; }
  tr:nth-child(even) td { background: #fafafa; }
  .status-pago { color: #16a34a; font-weight: 600; }
  .status-atrasado { color: #dc2626; font-weight: 600; }
  .status-a_pagar { color: #ca8a04; font-weight: 600; }
  .status-previsto { color: #606060; }
  .header-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .orange { color: #FF7924; font-weight: 700; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
<div class="header-bar">
  <h1>${terreno.nome}</h1>
  <span class="orange">INC Empreendimentos — Relatório Financeiro</span>
</div>
<p class="sub">${terreno.bairro}, ${terreno.cidade}/${terreno.uf} · Gerado em ${new Date().toLocaleDateString("pt-BR")}</p>
<div class="kpis">
  <div class="kpi"><label>Total acumulado</label><strong>${fmt(total)}</strong></div>
  <div class="kpi"><label>Pago</label><strong style="color:#16a34a">${fmt(pago)}</strong></div>
  <div class="kpi"><label>A pagar</label><strong style="color:#ca8a04">${fmt(aPagar)}</strong></div>
  <div class="kpi"><label>Atrasado</label><strong style="color:#dc2626">${fmt(atrasado)}</strong></div>
</div>
<table>
  <thead><tr><th>Tipo</th><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Pago em</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
</body></html>`;
}
