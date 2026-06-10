import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";
import { podeAssinarContrato } from "@/lib/due-diligence/podeAssinarContrato";

const Schema = z.object({
  status: z.enum(["MINUTA", "EM_REVISAO", "ANALISE_JURIDICA", "APROVADO", "ASSINADO", "RESCINDIDO"]),
  dataAssinatura: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  overrideJustificativa: z.string().optional(), // Admin override da trava de assinatura
});

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

  const { status, dataAssinatura, observacoes, overrideJustificativa } = parsed.data;

  // Somente Gestor/Admin podem aprovar ou assinar
  if (["APROVADO", "ASSINADO"].includes(status) && !["ADMIN", "GESTOR"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Apenas Gestor ou Admin podem aprovar/assinar contratos" }, { status: 403 });
  }

  // Trava de segurança: verifica matrícula e due diligence antes de assinar
  if (status === "ASSINADO") {
    const contratoPrev = await prisma.contrato.findUnique({ where: { id }, select: { terrenoId: true } });
    if (contratoPrev) {
      const verificacao = await podeAssinarContrato(contratoPrev.terrenoId);
      if (!verificacao.podeAssinar) {
        if (dbUser.role !== "ADMIN" || !overrideJustificativa) {
          return NextResponse.json({
            error: "Assinatura bloqueada por pendências de risco",
            pendencias: verificacao.pendencias,
            podeOverride: dbUser.role === "ADMIN",
          }, { status: 409 });
        }
        // Admin com justificativa: auditoria e prossegue
        await prisma.auditLog.create({
          data: {
            usuarioId: dbUser.id,
            terrenoId: contratoPrev.terrenoId,
            tipo: "UPDATE",
            entidade: "contrato",
            entidadeId: id,
            descricao: `Override de assinatura por Admin. Justificativa: ${overrideJustificativa}`,
            camposAlterados: { pendencias: verificacao.pendencias } as any,
          },
        });
      }
    }
  }

  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: { terreno: { select: { status: true } } },
  });
  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });

  const resultado = await prisma.$transaction(async (tx) => {
    const c = await tx.contrato.update({
      where: { id },
      data: {
        status,
        observacoes: observacoes ?? undefined,
        dataAssinatura: dataAssinatura ? new Date(dataAssinatura) : (status === "ASSINADO" ? new Date() : undefined),
      },
    });

    // Quando assinado: atualiza terreno e gera lançamentos financeiros
    if (status === "ASSINADO") {
      const terrenoAtual = await tx.terreno.findUnique({
        where: { id: c.terrenoId },
        select: { status: true, valorCompra: true, prazoPagamento: true, formaPagamento: true },
      });

      await tx.terreno.update({
        where: { id: c.terrenoId },
        data: { status: "CONTRATO_ASSINADO" },
      });

      await tx.terrenoStatusHistorico.create({
        data: {
          terrenoId: c.terrenoId,
          statusAnterior: terrenoAtual?.status ?? null,
          statusNovo: "CONTRATO_ASSINADO",
          observacao: `Contrato v${c.versao} assinado`,
          createdBy: dbUser.id,
        },
      });

      // Gera lançamentos financeiros com base nas cláusulas do contrato
      await gerarLancamentosFinanceiros(tx, c, dbUser.id);
    }

    await tx.auditLog.create({
      data: {
        usuarioId: dbUser.id,
        terrenoId: c.terrenoId,
        tipo: "UPDATE",
        entidade: "contrato",
        entidadeId: id,
        descricao: `Status do contrato v${c.versao} alterado para ${status}`,
      },
    });

    return c;
  });

  return NextResponse.json(resultado);
}

async function gerarLancamentosFinanceiros(
  tx: any,
  contrato: any,
  usuarioId: string
) {
  const dataBase = contrato.dataAssinatura ? new Date(contrato.dataAssinatura) : new Date();

  // Busca dados do terreno para calcular parcelas
  const terreno = await tx.terreno.findUnique({
    where: { id: contrato.terrenoId },
    select: { valorCompra: true, prazoPagamento: true, formaPagamento: true },
  });

  if (terreno?.valorCompra && terreno.valorCompra > 0) {
    const prazo = terreno.prazoPagamento ?? 1;
    const valorParcela = terreno.valorCompra / Math.max(prazo, 1);

    if (prazo <= 1) {
      // Pagamento à vista
      await tx.lancamentoFinanceiro.create({
        data: {
          terrenoId: contrato.terrenoId,
          contratoId: contrato.id,
          tipo: "PARCELA_TERRENISTA",
          descricao: "Pagamento integral ao terrenista",
          valor: terreno.valorCompra,
          vencimento: new Date(dataBase.getTime() + 30 * 86400000),
          status: "PREVISTO",
          createdBy: usuarioId,
        },
      });
    } else {
      // Parcelas mensais
      for (let i = 1; i <= Math.min(prazo, 60); i++) {
        const vencimento = new Date(dataBase);
        vencimento.setMonth(vencimento.getMonth() + i);

        await tx.lancamentoFinanceiro.create({
          data: {
            terrenoId: contrato.terrenoId,
            contratoId: contrato.id,
            tipo: "PARCELA_TERRENISTA",
            descricao: `Parcela ${i}/${prazo} ao terrenista`,
            valor: Math.round(valorParcela * 100) / 100,
            vencimento,
            status: "PREVISTO",
            recorrente: false,
            createdBy: usuarioId,
          },
        });
      }
    }
  }
}
