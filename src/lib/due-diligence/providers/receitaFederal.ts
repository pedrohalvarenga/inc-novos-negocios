import type { DueDiligenceProvider, ResultadoDueDiligence } from "./interface";

// API pública gratuita da Receita Federal (via ReceitaWS / BrasilAPI)
const BRASILAPI_URL = "https://brasilapi.com.br/api/cnpj/v1";

export const receitaFederalProvider: DueDiligenceProvider = {
  nome: "Receita Federal (BrasilAPI)",

  async consultar(cpfCnpj: string, tipo: "CPF" | "CNPJ"): Promise<ResultadoDueDiligence> {
    if (tipo === "CPF") {
      throw new Error("A consulta de CPF não está disponível via API pública. Use o modo manual.");
    }

    const cnpj = cpfCnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) {
      throw new Error("CNPJ inválido — deve ter 14 dígitos");
    }

    const response = await fetch(`${BRASILAPI_URL}/${cnpj}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (response.status === 404) {
      throw new Error("CNPJ não encontrado na base da Receita Federal");
    }

    if (!response.ok) {
      throw new Error(`Erro ao consultar Receita Federal (HTTP ${response.status})`);
    }

    const data = await response.json();

    return {
      cpfCnpj,
      tipo: "CNPJ",
      situacaoCadastral: data.descricao_situacao_cadastral,
      nome: data.razao_social,
      dataAbertura: data.data_inicio_atividade,
      situacao: data.descricao_situacao_cadastral,
      dadosCompletos: data,
    };
  },
};
