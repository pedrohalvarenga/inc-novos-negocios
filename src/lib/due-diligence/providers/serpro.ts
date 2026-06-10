import type { DueDiligenceProvider, ResultadoDueDiligence } from "./interface";

// Adapter stub — configure SERPRO_API_KEY no .env
export const serproProvider: DueDiligenceProvider = {
  nome: "Serpro / Datavalid",

  async consultar(cpfCnpj: string, tipo: "CPF" | "CNPJ"): Promise<ResultadoDueDiligence> {
    const apiKey = process.env.SERPRO_API_KEY;

    if (!apiKey) {
      throw new Error("SERPRO_API_KEY não configurada. Acesse Configurações > Due Diligence.");
    }

    // TODO: implementar quando contrato com Serpro for assinado
    throw new Error("Integração Serpro/Datavalid ainda não ativada. Configure as credenciais nas Configurações.");
  },
};
