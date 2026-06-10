import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const usuario = user
    ? await prisma.usuario.findUnique({ where: { supabaseId: user.id } })
    : null;

  if (usuario && !["GESTOR", "ADMIN"].includes(usuario.role)) {
    return NextResponse.json({ error: "Apenas Gestor ou Admin podem confirmar pagamento" }, { status: 403 });
  }

  const body = await req.json();
  const { dataPagamento, valorPago, comprovante } = body;

  const l = await prisma.lancamentoFinanceiro.update({
    where: { id: params.id },
    data: {
      status: "PAGO",
      dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date(),
      valor: valorPago ?? undefined,
      comprovante: comprovante ?? undefined,
    },
  });

  return NextResponse.json(l);
}
