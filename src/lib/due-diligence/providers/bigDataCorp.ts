import type { DueDiligenceProvider, ResultadoDueDiligence } from "./interface";

// Adapter stub — configure BIGDATACORP_API_KEY e BIGDATACORP_API_URL no .env
export const bigDataCorpProvider: DueDiligenceProvider = {
  nome: "BigDataCorp",

  async consultar(cpfCnpj: string, tipo: "CPF" | "CNPJ"): Promise<ResultadoDueDiligence> {
    const apiKey = process.env.BIGDATACORP_API_KEY;
    const apiUrl = process.env.BIGDATACORP_API_URL ?? "https://plataforma.bigdatacorp.com.br";

    if (!apiKey) {
      throw new Error("BIGDATACORP_API_KEY não configurada. Acesse Configurações > Due Diligence.");
    }

    // TODO: implementar quando contrato com BigDataCorp for assinado
    throw new Error("Integração BigDataCorp ainda não ativada. Configure as credenciais nas Configurações.");
  },
};
