import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";
import type { StatusTerreno } from "@prisma/client";

const Schema = z.object({
  status: z.enum(["RASCUNHO", "ENVIADA", "EM_NEGOCIACAO", "ACEITA", "RECUSADA", "EXPIRADA"]),
  motivoRecusa: z.string().optional().nullable(),
});

// Mapa: quando proposta atinge um status, atualiza terreno
const TERRENO_STATUS_MAP: Partial<Record<string, StatusTerreno>> = {
  ENVIADA: "PROPOSTA_ENVIADA",
  ACEITA: "PROPOSTA_ACEITA",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  const { id } = await params;
  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { status, motivoRecusa } = parsed.data;

  // Somente Gestor/Admin podem marcar como ENVIADA
  if (status === "ENVIADA" && !["ADMIN", "GESTOR"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Apenas Gestor ou Admin podem aprovar envio de proposta" }, { status: 403 });
  }

  const proposta = await prisma.proposta.findUnique({ where: { id } });
  if (!proposta) return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });

  const resultado = await prisma.$transaction(async (tx) => {
    const p = await tx.proposta.update({
      where: { id },
      data: {
        status,
        motivoRecusa: motivoRecusa ?? null,
        dataEnvio: status === "ENVIADA" ? new Date() : undefined,
      },
    });

    // Atualiza status do terreno se necessário
    const novoStatusTerreno = TERRENO_STATUS_MAP[status];
    if (novoStatusTerreno) {
      const terrenoAtual = await tx.terreno.findUnique({
        where: { id: p.terrenoId },
        select: { status: true },
      });

      await tx.terreno.update({
        where: { id: p.terrenoId },
        data: { status: novoStatusTerreno },
      });

      await tx.terrenoStatusHistorico.create({
        data: {
          terrenoId: p.terrenoId,
          statusAnterior: terrenoAtual?.status ?? null,
          statusNovo: novoStatusTerreno,
          observacao: `Proposta v${p.versao} marcada como ${status}`,
          createdBy: dbUser.id,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        usuarioId: dbUser.id,
        terrenoId: p.terrenoId,
        tipo: "UPDATE",
        entidade: "proposta",
        entidadeId: id,
        descricao: `Status da proposta v${p.versao} alterado para ${status}${motivoRecusa ? `: ${motivoRecusa}` : ""}`,
      },
    });

    return p;
  });

  return NextResponse.json(resultado);
}
