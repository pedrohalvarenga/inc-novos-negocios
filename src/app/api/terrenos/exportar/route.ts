import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { calcularScore } from "@/lib/score";
import { STATUS_TERRENO_LABELS, FORMA_PAGAMENTO_LABELS } from "@/lib/constants";
import * as XLSX from "xlsx";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const terrenos = await prisma.terreno.findMany({
    include: {
      criador: { select: { nome: true } },
      responsavel: { select: { nome: true } },
      proprietarios: { include: { proprietario: { select: { nomeRazaoSocial: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const rows = terrenos.map((t) => {
    const { score, percentualTerreno } = calcularScore({
      valorCompra: t.valorCompra,
      vgvEstimado: t.vgvEstimado,
      formaPagamento: t.formaPagamento,
      prazoPagamento: t.prazoPagamento,
    });

    return {
      Nome: t.nome,
      Apelido: t.apelido ?? "",
      Cidade: t.cidade,
      UF: t.uf,
      Bairro: t.bairro,
      "Endereço": t.logradouro,
      "Área (m²)": t.areaTerreno,
      Status: STATUS_TERRENO_LABELS[t.status],
      "VGV Estimado (R$)": t.vgvEstimado ?? "",
      "Valor Pedido (R$)": t.valorPedido ?? "",
      "Valor Compra (R$)": t.valorCompra ?? "",
      "% Terreno/VGV": percentualTerreno ? `${percentualTerreno.toFixed(1)}%` : "",
      "Forma de Pagamento": t.formaPagamento ? FORMA_PAGAMENTO_LABELS[t.formaPagamento] : "",
      "Prazo (meses)": t.prazoPagamento ?? "",
      "% Permuta": t.percentualPermuta ?? "",
      Unidades: t.numUnidadesEstimado ?? "",
      "Área Privativa Média (m²)": t.areaPrivativaMedia ?? "",
      Zoneamento: t.zoneamento ?? "",
      Score: score,
      "Proprietários": t.proprietarios.map((p) => p.proprietario.nomeRazaoSocial).join(", "),
      Responsável: t.responsavel?.nome ?? "",
      "Criado por": t.criador.nome,
      "Data de Cadastro": t.createdAt.toLocaleDateString("pt-BR"),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Terrenos");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="terrenos-inc-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
