import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { StatusUpdateSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser || dbUser.role === "LEITURA") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = StatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const terreno = await prisma.terreno.findUnique({ where: { id } });
  if (!terreno) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    const t = await tx.terreno.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    await tx.terrenoStatusHistorico.create({
      data: {
        terrenoId: id,
        statusAnterior: terreno.status,
        statusNovo: parsed.data.status,
        observacao: parsed.data.observacao,
        createdBy: dbUser.id,
      },
    });

    await tx.auditLog.create({
      data: {
        usuarioId: dbUser.id,
        terrenoId: id,
        tipo: "UPDATE",
        entidade: "terreno",
        entidadeId: id,
        descricao: `Status alterado: ${terreno.status} → ${parsed.data.status}`,
      },
    });

    return t;
  });

  return NextResponse.json(updated);
}
