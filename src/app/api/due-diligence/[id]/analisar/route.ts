import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `Você é um especialista em análise de risco de crédito e due diligence jurídica da INC Empreendimentos, incorporadora brasileira.

Seu papel é analisar o resultado de uma due diligence de vendedor de terreno e:
1. Calcular um score de risco de 0 a 100 (0 = altíssimo risco, 100 = sem riscos)
2. Identificar alertas de fraude contra credores ou fraude à execução
3. Redigir um parecer claro e simples para a equipe de negócios
4. Sugerir proteções contratuais específicas para a INC

Responda SOMENTE em JSON estruturado, em português do Brasil, sem markdown ao redor do JSON.`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  if (!checkRateLimit(`dd-${user.id}`, 15_000)) {
    return NextResponse.json({ error: "Aguarde alguns segundos antes de nova análise" }, { status: 429 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada" }, { status: 503 });
  }

  const { id } = await params;
  const dd = await prisma.dueDiligence.findUnique({
    where: { id },
    include: {
      proprietario: { select: { nomeRazaoSocial: true, cpfCnpj: true } },
    },
  });

  if (!dd) return NextResponse.json({ error: "Due Diligence não encontrada" }, { status: 404 });

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  const checklist = ((dd as any).checklist ?? []) as { item: string; status: string; evidencia?: string }[];

  const userPrompt = `Analise esta due diligence e gere um parecer de risco:

VENDEDOR: ${dd.proprietario.nomeRazaoSocial}
CPF/CNPJ: ${dd.proprietario.cpfCnpj ?? "Não informado"}
TIPO: ${dd.tipo}

CHECKLIST DE ITENS:
${checklist.map((c) => `- ${c.item}: ${c.status}${c.evidencia ? ` (${c.evidencia})` : ""}`).join("\n")}

DADOS ADICIONAIS:
${dd.resultado ? JSON.stringify(dd.resultado, null, 2) : "Nenhum dado adicional disponível"}

Retorne um JSON com exatamente esta estrutura:
{
  "score": 75,
  "resumoRiscos": "resumo claro e direto dos principais riscos identificados em 3-5 frases, linguagem simples para equipe de negócios",
  "alertaFraude": true ou false,
  "motivoAlertaFraude": "se alertaFraude for true, explique o motivo em 1-2 frases",
  "recomendacoes": [
    "lista de recomendações de proteção à INC (ex: solicitar certidões atualizadas, incluir cláusula de retenção, etc.)"
  ],
  "podeProsseguir": "SIM | COM_RESSALVAS | NAO",
  "justificativaProsseguir": "justificativa em 1-2 frases"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao chamar API de IA");
    }

    const aiResponse = await response.json();
    const texto = aiResponse.content?.[0]?.text ?? "{}";
    const json = texto.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
    const parecer = JSON.parse(json);

    const updated = await prisma.dueDiligence.update({
      where: { id },
      data: {
        score: parecer.score,
        resumo: parecer.resumoRiscos,
        resultado: { ...((dd.resultado as any) ?? {}), parecer },
        dataAnalise: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        usuarioId: dbUser.id,
        terrenoId: dd.terrenoId,
        tipo: "UPDATE",
        entidade: "due_diligence",
        entidadeId: id,
        descricao: `Parecer de IA gerado — score: ${parecer.score}/100`,
      },
    });

    return NextResponse.json({ parecer, dueDiligence: updated });
  } catch (err: any) {
    console.error("Erro parecer due diligence:", err);
    return NextResponse.json({ error: err.message ?? "Erro interno" }, { status: 500 });
  }
}
