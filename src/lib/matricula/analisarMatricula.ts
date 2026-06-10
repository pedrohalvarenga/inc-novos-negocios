import type { RiscoOnus } from "@prisma/client";

export interface Onus {
  tipo: string;
  descricao: string;
  risco: RiscoOnus;
  livroFolha?: string;
}

export interface DadosMatricula {
  numero: string;
  cartorioComarca: string;
  descricaoImovel: string;
  areaRegistrada?: number;
  proprietariosAtuais: { nome: string; cpfCnpj?: string }[];
  cadeiaDominial: { data?: string; descricao: string }[];
  registrosAverbacoes: string[];
  onus: Onus[];
  riscoConsolidado: RiscoOnus;
  observacoes?: string;
}

export interface ImagemParaAnalisar {
  data: string;      // base64
  mimeType: string;  // image/jpeg | image/png | image/webp | image/gif
}

const SYSTEM_PROMPT = `Você é um especialista em análise de matrículas de imóveis brasileiros, com profunda expertise em direito registral imobiliário, Lei 6.015/73 (Lei dos Registros Públicos) e legislação correlata.

Seu papel é analisar imagens de matrículas imobiliárias e extrair dados estruturados com precisão, identificando todos os ônus, gravames e restrições registradas.

Classifique os riscos assim:
- IMPEDITIVO: indisponibilidade de bens, penhora não baixada, bloqueio judicial, arresto
- ALTO: hipoteca vigente, alienação fiduciária vigente, ações reais/reipersecutórias, usufruto
- MÉDIO: servidão, cláusulas restritivas de inalienabilidade/impenhorabilidade, divergência de área, enfiteuse
- BAIXO: averbações informativas, atualizações cadastrais, construções averbadas, casamento/divórcio

Responda SOMENTE em JSON estruturado, em português do Brasil, sem markdown ao redor do JSON.`;

const USER_PROMPT = `Analise estas imagens de matrícula imobiliária e extraia todos os dados em JSON com exatamente esta estrutura:

{
  "numero": "número da matrícula (ex: 12.345)",
  "cartorioComarca": "nome do cartório e comarca (ex: 2º Cartório de Registro de Imóveis de São Paulo - SP)",
  "descricaoImovel": "descrição completa do imóvel conforme consta na matrícula",
  "areaRegistrada": 450.00,
  "proprietariosAtuais": [
    { "nome": "Nome Completo", "cpfCnpj": "CPF ou CNPJ se constar" }
  ],
  "cadeiaDominial": [
    { "data": "DD/MM/AAAA", "descricao": "descrição da transmissão" }
  ],
  "registrosAverbacoes": [
    "descrição resumida de cada registro ou averbação"
  ],
  "onus": [
    {
      "tipo": "tipo do ônus (ex: Hipoteca, Penhora, Alienação Fiduciária, etc.)",
      "descricao": "descrição detalhada do ônus",
      "risco": "IMPEDITIVO | ALTO | MEDIO | BAIXO",
      "livroFolha": "referência de livro/folha se disponível"
    }
  ],
  "riscoConsolidado": "IMPEDITIVO | ALTO | MEDIO | BAIXO",
  "observacoes": "observações adicionais relevantes ou null"
}

IMPORTANTE: Se não houver ônus, retorne onus como array vazio []. O riscoConsolidado deve refletir o ônus de maior gravidade encontrado. Se não houver ônus, riscoConsolidado = "BAIXO".`;

export async function analisarMatriculaComIA(
  imagens: ImagemParaAnalisar[]
): Promise<DadosMatricula> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY não configurada");
  }

  const imagensContent = imagens.map((img) => ({
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: img.mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
      data: img.data,
    },
  }));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            ...imagensContent,
            { type: "text", text: USER_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Anthropic API error:", err);
    throw new Error("Erro ao chamar API de IA");
  }

  const aiResponse = await response.json();
  const texto = aiResponse.content?.[0]?.text ?? "{}";

  try {
    // Remove possíveis backticks de markdown se a IA ignorar a instrução
    const json = texto.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
    return JSON.parse(json) as DadosMatricula;
  } catch {
    throw new Error("Resposta inválida da IA — não foi possível interpretar o JSON");
  }
}

export function calcularRiscoConsolidado(onus: Onus[]): RiscoOnus {
  if (!onus || onus.length === 0) return "BAIXO";
  const prioridade: Record<RiscoOnus, number> = {
    IMPEDITIVO: 4,
    ALTO: 3,
    MEDIO: 2,
    BAIXO: 1,
  };
  return onus.reduce((acc, o) => {
    return prioridade[o.risco] > prioridade[acc] ? o.risco : acc;
  }, "BAIXO" as RiscoOnus);
}
