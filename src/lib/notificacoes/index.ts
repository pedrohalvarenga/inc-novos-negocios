import { prisma } from "@/lib/prisma";
import { enviarEmail } from "./email";

export type TipoNotificacao =
  | "LANCAMENTO_VENCE_7_DIAS"
  | "LANCAMENTO_VENCE_HOJE"
  | "LANCAMENTO_ATRASADO"
  | "ZENKIT_SYNC_ERRO"
  | "PROPOSTA_EXPIRANDO"       // TODO: conectar na Fase 1/2
  | "CONTRATO_DATA_CRITICA";   // TODO: conectar na Fase 1/2

export interface PayloadNotificacao {
  lancamentoId?: string;
  terrenoNome?: string;
  valor?: number;
  vencimento?: string;
  erroDetalhes?: string;
}

export async function notificar(
  usuarioId: string | null,
  tipo: TipoNotificacao,
  payload: PayloadNotificacao,
  canais: ("app" | "email")[] = ["app"]
) {
  const { titulo, mensagem } = montarTexto(tipo, payload);

  if (canais.includes("app")) {
    await prisma.notificacao.create({
      data: { usuarioId, tipo, titulo, mensagem, payload: payload as any },
    });
  }

  if (canais.includes("email") && usuarioId) {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (usuario?.email) {
      await enviarEmail(usuario.email, titulo, mensagem).catch(() => {});
    }
  }
}

function montarTexto(tipo: TipoNotificacao, p: PayloadNotificacao) {
  const fmt = (v?: number) =>
    v != null
      ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "";

  switch (tipo) {
    case "LANCAMENTO_VENCE_7_DIAS":
      return {
        titulo: `Lançamento vence em 7 dias — ${p.terrenoNome}`,
        mensagem: `Um lançamento de ${fmt(p.valor)} vence em ${p.vencimento}.`,
      };
    case "LANCAMENTO_VENCE_HOJE":
      return {
        titulo: `Lançamento vence hoje — ${p.terrenoNome}`,
        mensagem: `Um lançamento de ${fmt(p.valor)} vence hoje.`,
      };
    case "LANCAMENTO_ATRASADO":
      return {
        titulo: `Lançamento atrasado — ${p.terrenoNome}`,
        mensagem: `Um lançamento de ${fmt(p.valor)} está em atraso (venceu em ${p.vencimento}).`,
      };
    case "ZENKIT_SYNC_ERRO":
      return {
        titulo: "Falha na sincronização Zenkit",
        mensagem: p.erroDetalhes ?? "Ocorreu um erro durante a sincronização.",
      };
    case "PROPOSTA_EXPIRANDO":
      // TODO: conectar quando Fase 1/2 expuser dados de propostas prestes a expirar
      return { titulo: "Proposta expirando", mensagem: "Uma proposta está prestes a expirar." };
    case "CONTRATO_DATA_CRITICA":
      // TODO: conectar quando Fase 1/2 expuser datas críticas de contrato
      return { titulo: "Data crítica de contrato", mensagem: "Um contrato possui data crítica próxima." };
    default:
      return { titulo: "Notificação", mensagem: "" };
  }
}
