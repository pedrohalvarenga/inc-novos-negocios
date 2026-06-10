export function lancamentosParaCsv(lancamentos: any[]): string {
  const header = [
    "ID",
    "Terreno",
    "Tipo",
    "Descrição",
    "Valor",
    "Vencimento",
    "Status",
    "Data Pagamento",
    "Recorrente",
  ].join(";");

  const rows = lancamentos.map((l) =>
    [
      l.id,
      l.terreno?.nome ?? l.terrenoId,
      l.tipo,
      l.descricao ?? "",
      String(l.valor).replace(".", ","),
      l.vencimento ? new Date(l.vencimento).toLocaleDateString("pt-BR") : "",
      l.status,
      l.dataPagamento ? new Date(l.dataPagamento).toLocaleDateString("pt-BR") : "",
      l.recorrente ? "Sim" : "Não",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(";")
  );

  return [header, ...rows].join("\r\n");
}
