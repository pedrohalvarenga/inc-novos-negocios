import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";
import type { ClausulasContrato, AnaliseClausula } from "@/lib/contratos/template";

const Schema = z.object({
  clausulaKey: z.string().optional(),
  respostaManual: z.string().optional(), // modo híbrido: JSON colado pelo usuário
});

const SYSTEM_PROMPT = `Você é um advogado especialista da INC Empreendimentos, empresa incorporadora brasileira, com profunda expertise em direito imobiliário brasileiro, especialmente em compra e venda de terrenos, permuta física e financeira, incorporação imobiliária e legislação aplicável (Lei 4.591/64, Código Civil Brasileiro, Lei 13.786/18 — Lei do Distrato, Lei 6.766/79).

Seu papel é SEMPRE proteger os interesses da INC Empreendimentos (compradora) nas negociações de aquisição de terrenos. Você deve:

1. Identificar riscos jurídicos nas cláusulas contratuais para a INC
2. Sugerir redações alternativas mais favoráveis à INC
3. Apontar cláusulas importantes que estejam ausentes
4. Dar dicas práticas de negociação para proteger a INC

Responda SEMPRE em JSON estruturado, em português do Brasil, sem markdown ao redor do JSON.`;

const USER_PROMPT_CLAUSULA = (clausula: { titulo: string; conteudo: string }) => `
Analise esta cláusula do instrumento particular de promessa de compra e venda de terreno:

TÍTULO: ${clausula.titulo}
CONTEÚDO:
${clausula.conteudo}

Retorne um JSON com exatamente esta estrutura:
{
  "risco": "BAIXO" | "MEDIO" | "ALTO",
  "explicacao": "explicação clara do risco identificado para a INC, em 2-3 frases simples",
  "sugestao": "sugestão de redação alternativa mais favorável à INC",
  "dicasNegociacao": "1-2 dicas práticas de negociação para a INC ao negociar esta cláusula"
}`;

const USER_PROMPT_COMPLETO = (clausulas: ClausulasContrato) => {
  const clausulasTexto = Object.values(clausulas)
    .map((c) => `\n--- ${c.titulo} ---\n${c.conteudo}`)
    .join("\n");

  return `
Analise este instrumento particular de promessa de compra e venda de terreno completo:

${clausulasTexto}

Retorne um JSON com exatamente esta estrutura:
{
  "resumoGeral": "resumo geral dos principais riscos identificados em 3-4 frases",
  "clausulasAusentes": [
    {
      "nome": "nome da cláusula ausente",
      "importancia": "por que esta cláusula é importante para proteger a INC",
      "sugestaoTexto": "sugestão de texto para esta cláusula"
    }
  ],
  "principaisRiscos": [
    {
      "clausula": "identificação da cláusula",
      "risco": "BAIXO" | "MEDIO" | "ALTO",
      "descricao": "descrição do risco"
    }
  ],
  "recomendacao": "recomendação geral sobre prosseguir, negociar ou não assinar este contrato"
}`;
};

const SchemaClausula = z.object({
  risco: z.enum(["BAIXO", "MEDIO", "ALTO"]),
  explicacao: z.string(),
  sugestao: z.string().optional(),
  dicasNegociacao: z.string().optional(),
});

const SchemaCompleto = z.object({
  resumoGeral: z.string(),
  clausulasAusentes: z.array(z.object({
    nome: z.string(),
    importancia: z.string(),
    sugestaoTexto: z.string().optional(),
  })).optional(),
  principaisRiscos: z.array(z.object({
    clausula: z.string(),
    risco: z.enum(["BAIXO", "MEDIO", "ALTO"]),
    descricao: z.string(),
  })).optional(),
  recomendacao: z.string().optional(),
});

function limparJson(texto: string): unknown {
  const limpo = texto.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(limpo);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const contrato = await prisma.contrato.findUnique({ where: { id } });
  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });

  const clausulas = (contrato.clausulas ?? {}) as unknown as ClausulasContrato;
  const { clausulaKey, respostaManual } = parsed.data;

  // Modo híbrido: processar resposta manual colada pelo usuário
  if (respostaManual !== undefined) {
    try {
      const json = limparJson(respostaManual);
      if (clausulaKey) {
        const result = SchemaClausula.safeParse(json);
        if (!result.success) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const msgs = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ");
          return NextResponse.json({ error: `JSON inválido: ${msgs}` }, { status: 400 });
        }
        const clausula = clausulas[clausulaKey];
        if (!clausula) return NextResponse.json({ error: "Cláusula não encontrada" }, { status: 404 });
        const analise: AnaliseClausula = { ...result.data, analisadoEm: new Date().toISOString(), origem: "análise manual" } as any;
        clausulas[clausulaKey] = { ...clausula, analise };
        await prisma.contrato.update({ where: { id }, data: { clausulas: clausulas as any } });
        return NextResponse.json({ clausulaKey, analise });
      } else {
        const result = SchemaCompleto.safeParse(json);
        if (!result.success) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const msgs = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ");
          return NextResponse.json({ error: `JSON inválido: ${msgs}` }, { status: 400 });
        }
        return NextResponse.json({ tipo: "completa", analise: result.data, analisadoEm: new Date().toISOString() });
      }
    } catch {
      return NextResponse.json({ error: "JSON inválido. Verifique se a resposta está no formato correto." }, { status: 400 });
    }
  }

  // Sem API key → retornar prompt para modo híbrido
  if (!process.env.ANTHROPIC_API_KEY) {
    if (clausulaKey) {
      const clausula = clausulas[clausulaKey];
      if (!clausula) return NextResponse.json({ error: "Cláusula não encontrada" }, { status: 404 });
      const prompt = `${SYSTEM_PROMPT}\n\n${USER_PROMPT_CLAUSULA(clausula)}`;
      return NextResponse.json({ modoHibrido: true, clausulaKey, prompt });
    } else {
      const prompt = `${SYSTEM_PROMPT}\n\n${USER_PROMPT_COMPLETO(clausulas)}`;
      return NextResponse.json({ modoHibrido: true, prompt });
    }
  }

  // Modo automático (API key configurada)
  try {
    if (clausulaKey) {
      const clausula = clausulas[clausulaKey];
      if (!clausula) return NextResponse.json({ error: "Cláusula não encontrada" }, { status: 404 });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: USER_PROMPT_CLAUSULA(clausula) }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("Anthropic API error:", err);
        return NextResponse.json({ error: "Erro ao chamar API de IA" }, { status: 502 });
      }

      const aiResponse = await response.json();
      const texto = aiResponse.content?.[0]?.text ?? "{}";

      let analise: AnaliseClausula;
      try {
        analise = { ...JSON.parse(texto), analisadoEm: new Date().toISOString() };
      } catch {
        return NextResponse.json({ error: "Resposta inválida da IA" }, { status: 502 });
      }

      clausulas[clausulaKey] = { ...clausula, analise };
      await prisma.contrato.update({ where: { id }, data: { clausulas: clausulas as any } });
      return NextResponse.json({ clausulaKey, analise });
    } else {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: USER_PROMPT_COMPLETO(clausulas) }],
        }),
      });

      if (!response.ok) {
        return NextResponse.json({ error: "Erro ao chamar API de IA" }, { status: 502 });
      }

      const aiResponse = await response.json();
      const texto = aiResponse.content?.[0]?.text ?? "{}";

      let analiseCompleta;
      try {
        analiseCompleta = JSON.parse(texto);
      } catch {
        return NextResponse.json({ error: "Resposta inválida da IA" }, { status: 502 });
      }

      return NextResponse.json({ tipo: "completa", analise: analiseCompleta, analisadoEm: new Date().toISOString() });
    }
  } catch (err) {
    console.error("Erro análise IA:", err);
    return NextResponse.json({ error: "Erro interno ao analisar contrato" }, { status: 500 });
  }
}
