import { NextRequest, NextResponse } from "next/server";
import { atualizarStatusVencidos } from "@/lib/financeiro/recorrencias";
import { dispararNotificacoesVencimento } from "@/lib/notificacoes/gatilhos";

export async function POST(_: NextRequest) {
  const atualizados = await atualizarStatusVencidos();
  await dispararNotificacoesVencimento();
  return NextResponse.json({ atualizados, ok: true });
}

// Permite chamada GET para facilitar teste via URL
export const GET = POST;
