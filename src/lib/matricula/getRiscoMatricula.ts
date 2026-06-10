import { prisma } from "@/lib/prisma";
import type { RiscoOnus } from "@prisma/client";

export interface RiscoMatriculaResult {
  terrenoId: string;
  risco: RiscoOnus | null;
  temMatricula: boolean;
  matriculaId?: string;
  onus?: { tipo: string; descricao: string; risco: RiscoOnus }[];
}

/**
 * Retorna o risco consolidado da matrícula de um terreno.
 * Exportada para consumo pela Fase 1 no score de negociação.
 */
export async function getRiscoMatricula(terrenoId: string): Promise<RiscoMatriculaResult> {
  const matricula = await prisma.matricula.findFirst({
    where: { terrenoId },
    orderBy: { updatedAt: "desc" },
  });

  if (!matricula) {
    return { terrenoId, risco: null, temMatricula: false };
  }

  return {
    terrenoId,
    risco: matricula.riscoOnus,
    temMatricula: true,
    matriculaId: matricula.id,
    onus: ((matricula as any).onus as any[]) ?? [],
  };
}
