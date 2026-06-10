import { prisma } from "@/lib/prisma";

export interface ConfigRecorrencia {
  frequencia: "MENSAL" | "ANUAL" | "QUINZENAL" | "SEMANAL";
  totalParcelas: number;
}

export async function gerarOcorrencias(
  lancamentoBaseId: string,
  config: ConfigRecorrencia
) {
  const base = await prisma.lancamentoFinanceiro.findUnique({
    where: { id: lancamentoBaseId },
  });
  if (!base || !base.vencimento) return [];

  const { frequencia, totalParcelas } = config;

  const novas = [];
  for (let i = 1; i < totalParcelas; i++) {
    const venc = new Date(base.vencimento);
    if (frequencia === "MENSAL") venc.setMonth(venc.getMonth() + i);
    else if (frequencia === "ANUAL") venc.setFullYear(venc.getFullYear() + i);
    else if (frequencia === "QUINZENAL") venc.setDate(venc.getDate() + 15 * i);
    else if (frequencia === "SEMANAL") venc.setDate(venc.getDate() + 7 * i);

    novas.push(
      prisma.lancamentoFinanceiro.create({
        data: {
          terrenoId: base.terrenoId,
          contratoId: base.contratoId,
          tipo: base.tipo,
          descricao: base.descricao
            ? `${base.descricao} (${i + 1}/${totalParcelas})`
            : undefined,
          valor: base.valor,
          vencimento: venc,
          status: "PREVISTO",
          recorrente: true,
          recorrencia: frequencia,
          recorrenciaConfig: {
            frequencia,
            totalParcelas,
            parcelaAtual: i + 1,
          },
          createdBy: base.createdBy,
        },
      })
    );
  }

  await prisma.$transaction(novas);
  return novas;
}

export async function atualizarStatusVencidos() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const { count } = await prisma.lancamentoFinanceiro.updateMany({
    where: {
      status: { in: ["PREVISTO", "A_PAGAR"] },
      vencimento: { lt: hoje },
    },
    data: { status: "ATRASADO" },
  });

  return count;
}
