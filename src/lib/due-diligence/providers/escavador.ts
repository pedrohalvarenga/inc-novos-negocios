import type { DueDiligenceProvider, ResultadoDueDiligence } from "./interface";

// Adapter stub — configure ESCAVADOR_API_KEY no .env
export const escavadorProvider: DueDiligenceProvider = {
  nome: "Escavador",

  async consultar(cpfCnpj: string, tipo: "CPF" | "CNPJ"): Promise<ResultadoDueDiligence> {
    const apiKey = process.env.ESCAVADOR_API_KEY;

    if (!apiKey) {
      throw new Error("ESCAVADOR_API_KEY não configurada. Acesse Configurações > Due Diligence.");
    }

    // TODO: implementar quando contrato com Escavador for assinado
    throw new Error("Integração Escavador ainda não ativada. Configure as credenciais nas Configurações.");
  },
};
