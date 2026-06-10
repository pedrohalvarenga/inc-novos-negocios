import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";
import { analisarMatriculaComIA, calcularRiscoConsolidado } from "@/lib/matricula/analisarMatricula";
import { checkRateLimit } from "@/lib/rateLimit";
import type { RiscoOnus } from "@prisma/client";

const Schema = z.object({
  imagens: z.array(z.object({
    data: z.string().min(1),
    mimeType: z.string().min(1),
    nome: z.string().optional(),
    tamanho: z.number().optional(),
  })).min(1).max(20).optional(),
  respostaManual: z.string().optional(), // modo híbrido: JSON colado pelo usuário
});

const PROMPT_EXTRACAO = (nomeTerreno?: string) => `Você é um especialista em análise de matrículas imobiliárias brasileiras da INC Empreendimentos.

Analise as imagens da matrícula${nomeTerreno ? ` do imóvel "${nomeTerreno}"` : ""} e extraia todas as informações relevantes.

Retorne um JSON com EXATAMENTE esta estrutura (todos os campos são obrigatórios, use null quando não encontrado):
{
  "numero": "número da matrícula",
  "cartorioComarca": "nome do cartório — comarca (ex: 1º Ofício de Registro de Imóveis — São Paulo)",
  "area": 0,
  "proprietarios": [
    {
      "nome": "nome completo",
      "cpfCnpj": "cpf ou cnpj",
      "participacao": 100
    }
  ],
  "cadeiaDominial": [
    {
      "ordem": 1,
      "descricao": "descrição da transferência",
      "data": "data em ISO (YYYY-MM-DD) ou null"
    }
  ],
  "onus": [
    {
      "tipo": "tipo do ônus (ex: Hipoteca, Penhora, Alienação Fiduciária)",
      "descricao": "descrição detalhada",
      "risco": "BAIXO" | "MEDIO" | "ALTO" | "IMPEDITIVO",
      "dataRegistro": "data em ISO ou null",
      "cancelado": false
    }
  ],
  "riscoConsolidado": "BAIXO" | "MEDIO" | "ALTO" | "IMPEDITIVO",
  "observacoes": "observações gerais relevantes para a aquisição do imóvel pela INC"
}

Regras para risco:
- IMPEDITIVO: penhora ativa, hipoteca não cancelada, bloqueio judicial
- ALTO: indisponibilidade, alienação fiduciária ativa
- MEDIO: usufruto, servidão, ônus cancelado recentemente
- BAIXO: sem ônus ou apenas ônus cancelados`;

const SchemaResposta = z.object({
  numero: z.string().nullable().optional(),
  cartorioComarca: z.string().nullable().optional(),
  area: z.number().nullable().optional(),
  proprietarios: z.array(z.object({
    nome: z.string(),
    cpfCnpj: z.string().nullable().optional(),
    participacao: z.number().nullable().optional(),
  })).optional(),
  cadeiaDominial: z.array(z.object({
    ordem: z.number().optional(),
    descricao: z.string(),
    data: z.string().nullable().optional(),
  })).optional(),
  onus: z.array(z.object({
    tipo: z.string(),
    descricao: z.string().optional(),
    risco: z.enum(["BAIXO", "MEDIO", "ALTO", "IMPEDITIVO"]).optional(),
    dataRegistro: z.string().nullable().optional(),
    cancelado: z.boolean().optional(),
  })).optional(),
  riscoConsolidado: z.enum(["BAIXO", "MEDIO", "ALTO", "IMPEDITIVO"]).optional(),
  observacoes: z.string().nullable().optional(),
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

  const { respostaManual, imagens } = parsed.data;

  // Modo híbrido: processar JSON colado
  if (respostaManual !== undefined) {
    try {
      const limpo = respostaManual.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const json = JSON.parse(limpo);
      const result = SchemaResposta.safeParse(json);
      if (!result.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msgs = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ");
        return NextResponse.json({ error: `JSON inválido: ${msgs}` }, { status: 400 });
      }
      const dados = result.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const riscoConsolidado = dados.riscoConsolidado ?? calcularRiscoConsolidado((dados.onus ?? []) as any);
      const updated = await prisma.matricula.update({
        where: { id },
        data: {
          numero: dados.numero ?? matricula.numero,
          cartorio: dados.cartorioComarca?.split(" — ")[0] ?? matricula.cartorio,
          comarca: dados.cartorioComarca?.split(" — ")[1] ?? matricula.comarca,
          dadosExtraidos: dados as any,
          onus: (dados.onus ?? []) as any,
          riscoOnus: riscoConsolidado as RiscoOnus,
        },
      });
      await prisma.auditLog.create({
        data: {
          usuarioId: dbUser.id,
          terrenoId: matricula.terrenoId,
          tipo: "UPDATE",
          entidade: "matricula",
          entidadeId: id,
          descricao: `Análise de matrícula (modo híbrido manual) — risco: ${riscoConsolidado}`,
        },
      });
      return NextResponse.json({ matricula: updated, dados, riscoConsolidado });
    } catch {
      return NextResponse.json({ error: "JSON inválido. Verifique se a resposta está no formato correto." }, { status: 400 });
    }
  }

  // Sem API key → retornar prompt para modo híbrido
  if (!process.env.ANTHROPIC_API_KEY) {
    const prompt = PROMPT_EXTRACAO(matricula.terreno?.nome);
    return NextResponse.json({ modoHibrido: true, prompt });
  }

  // Modo automático (API key configurada)
  if (!imagens || imagens.length === 0) {
    return NextResponse.json({ error: "Imagens obrigatórias para análise automática" }, { status: 400 });
  }

  try {
    const dados = await analisarMatriculaComIA(
      imagens.map((img) => ({ data: img.data, mimeType: img.mimeType }))
    );

    const riscoConsolidado = dados.riscoConsolidado ?? calcularRiscoConsolidado(dados.onus ?? []);
    const arquivos = imagens.map((img) => ({
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
