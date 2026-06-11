import { prisma } from "@/lib/prisma";
import { notificar } from "./index";

export async function dispararNotificacoesVencimento() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const em7Dias = new Date(hoje);
  em7Dias.setDate(hoje.getDate() + 7);
  const em8Dias = new Date(hoje);
  em8Dias.setDate(hoje.getDate() + 8);

  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);

  // Buscamos os usuários admins/gestores para notificar
  const gestores = await prisma.usuario.findMany({
    where: { role: { in: ["GESTOR", "ADMIN"] }, ativo: true },
    select: { id: true },
  });

  async function notificarTodos(tipo: any, payload: any) {
    for (const g of gestores) {
      await notificar(g.id, tipo, payload, ["app"]);
    }
  }

  // Vence em 7 dias
  const vence7 = await prisma.lancamentoFinanceiro.findMany({
    where: {
      status: { in: ["PREVISTO", "A_PAGAR"] },
      vencimento: { gte: em7Dias, lt: em8Dias },
    },
    include: { terreno: { select: { nome: true } } },
  });
  for (const l of vence7) {
    await notificarTodos("LANCAMENTO_VENCE_7_DIAS", {
      lancamentoId: l.id,
      terrenoNome: l.terreno.nome,
      valor: l.valor,
      vencimento: l.vencimento?.toLocaleDateString("pt-BR"),
    });
  }

  // Vence hoje
  const venceHoje = await prisma.lancamentoFinanceiro.findMany({
    where: {
      status: { in: ["PREVISTO", "A_PAGAR"] },
      vencimento: { gte: hoje, lt: amanha },
    },
    include: { terreno: { select: { nome: true } } },
  });
  for (const l of venceHoje) {
    await notificarTodos("LANCAMENTO_VENCE_HOJE", {
      lancamentoId: l.id,
      terrenoNome: l.terreno.nome,
      valor: l.valor,
      vencimento: l.vencimento?.toLocaleDateString("pt-BR"),
    });
  }

  // Atrasados (já foram marcados como ATRASADO pelo job de vencimentos)
  const atrasados = await prisma.lancamentoFinanceiro.findMany({
    where: { status: "ATRASADO", vencimento: { gte: new Date(hoje.getTime() - 86400000), lt: hoje } },
    include: { terreno: { select: { nome: true } } },
  });
  for (const l of atrasados) {
    await notificarTodos("LANCAMENTO_ATRASADO", {
      lancamentoId: l.id,
      terrenoNome: l.terreno.nome,
      valor: l.valor,
      vencimento: l.vencimento?.toLocaleDateString("pt-BR"),
    });
  }

  // Propostas expirando em 7 dias
  const propostasExpirando = await prisma.proposta.findMany({
    where: {
      status: { in: ["ENVIADA", "EM_NEGOCIACAO"] },
      validade: { gte: em7Dias, lt: em8Dias },
    },
    include: { terreno: { select: { nome: true } } },
  });
  for (const p of propostasExpirando) {
    await notificarTodos("PROPOSTA_EXPIRANDO", {
      propostaId: p.id,
      terrenoNome: p.terreno.nome,
      dataExpiracao: p.validade?.toLocaleDateString("pt-BR"),
    });
  }

  // Contratos com data de vencimento crítica em 7 dias
  const contratosDataCritica = await prisma.contrato.findMany({
    where: {
      status: { in: ["ASSINADO"] },
      dataVencimento: { gte: em7Dias, lt: em8Dias },
    },
    include: { terreno: { select: { nome: true } } },
  });
  for (const c of contratosDataCritica) {
    await notificarTodos("CONTRATO_DATA_CRITICA", {
      contratoId: c.id,
      terrenoNome: c.terreno.nome,
      dataCritica: c.dataVencimento?.toLocaleDateString("pt-BR"),
    });
  }
}
