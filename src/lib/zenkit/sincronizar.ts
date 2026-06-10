import { prisma } from "@/lib/prisma";
import { listarItens } from "./client";
import { notificar } from "@/lib/notificacoes";

interface LogEntry { tipo: "info" | "aviso" | "erro"; mensagem: string }

export async function sincronizarZenkit(userId: string): Promise<{
  criados: number;
  atualizados: number;
  erros: number;
  log: LogEntry[];
}> {
  const logId = await prisma.zenkitSyncLog.create({ data: { status: "EM_ANDAMENTO" } });

  const cfg = await prisma.configuracao.findUnique({ where: { chave: "zenkit_mapeamento" } });
  if (!cfg) throw new Error("Mapeamento Zenkit não configurado");

  const { listId, campos } = cfg.valor as any;
  const log: LogEntry[] = [];
  let criados = 0, atualizados = 0, erros = 0;

  try {
    const resposta = await listarItens(listId);
    const itens: any[] = resposta?.listEntries ?? [];

    for (const item of itens) {
      try {
        const zenkitItemId = String(item.id);
        const dadosMapeados = mapearCampos(item, campos);

        const existente = await prisma.terreno.findFirst({ where: { zenkitItemId } });

        if (existente) {
          // Não sobrescreve campos editados manualmente
          const protegidos: string[] = (existente as any).camposEditadosManualmente ?? [];
          const update: any = {};
          for (const [k, v] of Object.entries(dadosMapeados)) {
            if (!protegidos.includes(k)) update[k] = v;
          }

          if (protegidos.length > 0) {
            log.push({ tipo: "aviso", mensagem: `Terreno "${existente.nome}" — campos protegidos ignorados: ${protegidos.join(", ")}` });
          }

          await prisma.terreno.update({ where: { id: existente.id }, data: update });
          atualizados++;
          log.push({ tipo: "info", mensagem: `Atualizado: ${existente.nome}` });
        } else {
          const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
          await prisma.terreno.create({
            data: {
              ...dadosMapeados,
              zenkitItemId,
              origem: "ZENKIT",
              createdBy: userId,
            } as any,
          });
          criados++;
          log.push({ tipo: "info", mensagem: `Criado: ${dadosMapeados.nome ?? zenkitItemId}` });
        }
      } catch (e: any) {
        erros++;
        log.push({ tipo: "erro", mensagem: `Item ${item.id}: ${e.message}` });
      }
    }
  } catch (e: any) {
    erros++;
    log.push({ tipo: "erro", mensagem: e.message });
    await notificar(userId, "ZENKIT_SYNC_ERRO", { erroDetalhes: e.message }, ["app"]);
  }

  await prisma.zenkitSyncLog.update({
    where: { id: logId.id },
    data: { concluido: new Date(), criados, atualizados, erros, log, status: "CONCLUIDO" },
  });

  return { criados, atualizados, erros, log };
}

function mapearCampos(item: any, campos: Record<string, string>) {
  const result: any = {};
  const values = item.displayString ?? {};

  for (const [campoPrisma, campoZenkit] of Object.entries(campos)) {
    const val = values[campoZenkit] ?? item[campoZenkit];
    if (val !== undefined && val !== null) {
      result[campoPrisma] = val;
    }
  }

  return result;
}
