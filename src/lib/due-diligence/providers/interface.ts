export type StatusChecklist = "PENDENTE" | "OK" | "ALERTA" | "CRITICO";

export interface ItemChecklist {
  item: string;
  status: StatusChecklist;
  data?: string;         // ISO date string
  evidencia?: string;    // descrição ou URL da evidência
  fonte?: string;        // provedor da informação
}

export interface ResultadoDueDiligence {
  cpfCnpj: string;
  tipo: "CPF" | "CNPJ";
  situacaoCadastral?: string;
  nome?: string;
  dataAbertura?: string;
  situacao?: string;
  dadosCompletos?: Record<string, unknown>;
}

export interface DueDiligenceProvider {
  nome: string;
  consultar(cpfCnpj: string, tipo: "CPF" | "CNPJ"): Promise<ResultadoDueDiligence>;
}

export const ITENS_CHECKLIST_CPF: string[] = [
  "Situação cadastral CPF",
  "Processos cíveis",
  "Execuções fiscais",
  "Reclamações trabalhistas",
  "Protestos em cartório",
  "Falência / recuperação judicial",
  "Certidão negativa federal",
  "Certidão negativa estadual",
  "Certidão negativa municipal",
  "Certidão negativa trabalhista",
];

export const ITENS_CHECKLIST_CNPJ: string[] = [
  "Situação cadastral CNPJ",
  "Processos cíveis",
  "Execuções fiscais",
  "Reclamações trabalhistas",
  "Protestos em cartório",
  "Falência / recuperação judicial / dissolução",
  "Certidão negativa federal",
  "Certidão negativa estadual",
  "Certidão negativa municipal",
  "Certidão negativa trabalhista",
  "Quadro societário atualizado",
];

export function gerarChecklistInicial(tipo: "CPF" | "CNPJ"): ItemChecklist[] {
  const itens = tipo === "CPF" ? ITENS_CHECKLIST_CPF : ITENS_CHECKLIST_CNPJ;
  return itens.map((item) => ({ item, status: "PENDENTE" as StatusChecklist }));
}
