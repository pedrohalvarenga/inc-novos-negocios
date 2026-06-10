import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { TerrenoSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const terreno = await prisma.terreno.findUnique({
    where: { id },
    include: {
      criador: { select: { id: true, nome: true, email: true } },
      responsavel: { select: { id: true, nome: true, email: true } },
      proprietarios: { include: { proprietario: true } },
      corretor: true,
      statusHistorico: { orderBy: { createdAt: "asc" } },
      _count: { select: { propostas: true, contratos: true, matriculas: true } },
    },
  });

  if (!terreno) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return NextResponse.json(terreno);
}

export async function PUT(
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
  const parsed = TerrenoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { proprietarios, ...data } = parsed.data;

  const terreno = await prisma.$transaction(async (tx) => {
    const t = await tx.terreno.update({
      where: { id },
      data: {
        ...data,
        dataProspeccao: data.dataProspeccao ? new Date(data.dataProspeccao) : undefined,
      },
    });

    if (proprietarios !== undefined) {
      await tx.terrenoProprietario.deleteMany({ where: { terrenoId: id } });
      if (proprietarios.length) {
        await tx.terrenoProprietario.createMany({
          data: proprietarios.map((p) => ({
            terrenoId: id,
            proprietarioId: p.proprietarioId,
            percentual: p.percentual,
            principal: p.principal,
          })),
        });
      }
    }

    await tx.auditLog.create({
      data: {
        usuarioId: dbUser.id,
        terrenoId: id,
        tipo: "UPDATE",
        entidade: "terreno",
        entidadeId: id,
        descricao: `Terreno "${t.nome}" atualizado`,
      },
    });

    return t;
  });

  return NextResponse.json(terreno);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser || !["ADMIN", "GESTOR"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const terreno = await prisma.terreno.findUnique({ where: { id } });
  if (!terreno) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.$transaction([
    prisma.auditLog.create({
      data: {
        usuarioId: dbUser.id,
        tipo: "DELETE",
        entidade: "terreno",
        entidadeId: id,
        descricao: `Terreno "${terreno.nome}" excluído`,
      },
    }),
    prisma.terreno.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
