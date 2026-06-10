import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";
import { analisarMatriculaComIA, calcularRiscoConsolidado } from "@/lib/matricula/analisarMatricula";
import { checkRateLimit } from "@/lib/rateLimit";
import type { RiscoOnus } from "@prisma/client";

const Schema = z.object({
  imagens: z.array(z.object({
    data: z.string().min(1),       // base64
    mimeType: z.string().min(1),   // image/jpeg | image/png etc.
    nome: z.string().optional(),
    tamanho: z.number().optional(),
  })).min(1).max(20),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  if (!checkRateLimit(user.id, 15_000)) {
    return NextResponse.json({ error: "Aguarde alguns segundos antes de nova análise" }, { status: 429 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada" }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const matricula = await prisma.matricula.findUnique({
    where: { id },
    include: { terreno: { select: { id: true, nome: true } } },
  });
  if (!matricula) return NextResponse.json({ error: "Matrícula não encontrada" }, { status: 404 });

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  try {
    const dados = await analisarMatriculaComIA(
      parsed.data.imagens.map((img) => ({ data: img.data, mimeType: img.mimeType }))
    );

    const riscoConsolidado = dados.riscoConsolidado ?? calcularRiscoConsolidado(dados.onus ?? []);

    const arquivos = parsed.data.imagens.map((img) => ({
      nome: img.nome ?? "foto.jpg",
      tipo: img.mimeType,
      tamanho: img.tamanho ?? 0,
    }));

    const updated = await prisma.matricula.update({
      where: { id },
      data: {
        numero: dados.numero ?? matricula.numero,
        cartorio: dados.cartorioComarca?.split(" — ")[0] ?? matricula.cartorio,
        comarca: dados.cartorioComarca?.split(" — ")[1] ?? matricula.comarca,
        dadosExtraidos: dados as any,
        onus: (dados.onus ?? []) as any,
        riscoOnus: riscoConsolidado as RiscoOnus,
        arquivos: arquivos as any,
      },
    });

    await prisma.auditLog.create({
      data: {
        usuarioId: dbUser.id,
        terrenoId: matricula.terrenoId,
        tipo: "UPDATE",
        entidade: "matricula",
        entidadeId: id,
        descricao: `Análise de matrícula por IA concluída — risco: ${riscoConsolidado}`,
      },
    });

    return NextResponse.json({ matricula: updated, dados, riscoConsolidado });
  } catch (err: any) {
    console.error("Erro análise matrícula:", err);
    return NextResponse.json({ error: err.message ?? "Erro interno ao analisar matrícula" }, { status: 500 });
  }
}
