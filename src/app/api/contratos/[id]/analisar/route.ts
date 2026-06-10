import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";
import type { ClausulasContrato, AnaliseClausula } from "@/lib/contratos/template";

const Schema = z.object({
  clausulaKey: z.string().optional(), // se ausente, analisa o contrato completo
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada" }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const contrato = await prisma.contrato.findUnique({ where: { id } });
  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });

  const clausulas = (contrato.clausulas ?? {}) as unknown as ClausulasContrato;
  const { clausulaKey } = parsed.data;

  try {
    if (clausulaKey) {
      // Analisa cláusula específica
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

      // Salva análise na cláusula
      clausulas[clausulaKey] = { ...clausula, analise };
      await prisma.contrato.update({
        where: { id },
        data: { clausulas: clausulas as any },
      });

      return NextResponse.json({ clausulaKey, analise });
    } else {
      // Análise completa
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
