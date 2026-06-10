import { prisma } from "@/lib/prisma";

export interface PendenciaAssinatura {
  tipo: "MATRICULA_IMPEDITIVA" | "DUE_DILIGENCE_CRITICA";
  descricao: string;
  detalhe?: string;
}

export interface ResultadoVerificacao {
  podeAssinar: boolean;
  pendencias: PendenciaAssinatura[];
}

/**
 * Verifica se um contrato pode ser assinado.
 * Bloqueia se houver risco IMPEDITIVO na matrícula ou item CRITICO na due diligence.
 * Exportada para integração na rota de status do contrato.
 */
export async function podeAssinarContrato(terrenoId: string): Promise<ResultadoVerificacao> {
  const pendencias: PendenciaAssinatura[] = [];

  // Verifica matrícula
  const matricula = await prisma.matricula.findFirst({
    where: { terrenoId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, riscoOnus: true, numero: true },
  });

  if (matricula?.riscoOnus === "IMPEDITIVO") {
    pendencias.push({
      tipo: "MATRICULA_IMPEDITIVA",
      descricao: "Matrícula possui ônus IMPEDITIVO registrado",
      detalhe: matricula.numero ? `Matrícula nº ${matricula.numero}` : undefined,
    });
  }

  // Verifica due diligences dos proprietários do terreno
  const dueDiligences = await prisma.dueDiligence.findMany({
    where: { terrenoId },
    include: {
      proprietario: { select: { nomeRazaoSocial: true } },
    },
  });

  for (const dd of dueDiligences) {
    const checklist = ((dd as any).checklist ?? []) as { item: string; status: string }[];
    const criticos = checklist.filter((c) => c.status === "CRITICO");
    if (criticos.length > 0) {
      pendencias.push({
        tipo: "DUE_DILIGENCE_CRITICA",
        descricao: `Due Diligence de ${(dd as any).proprietario.nomeRazaoSocial} possui ${criticos.length} item(ns) CRÍTICO(s) pendente(s)`,
        detalhe: criticos.map((c) => c.item).join(", "),
      });
    }
  }

  return {
    podeAssinar: pendencias.length === 0,
    pendencias,
  };
}
