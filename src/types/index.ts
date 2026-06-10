import type {
  Terreno,
  Proprietario,
  Corretor,
  TerrenoProprietario,
  TerrenoStatusHistorico,
  Usuario,
} from "@prisma/client";

export type TerrenoComRelacoes = Terreno & {
  proprietarios: (TerrenoProprietario & {
    proprietario: Proprietario;
  })[];
  corretor: Corretor | null;
  criador: Pick<Usuario, "id" | "nome" | "email">;
  responsavel: Pick<Usuario, "id" | "nome" | "email"> | null;
  statusHistorico: TerrenoStatusHistorico[];
  _count?: {
    propostas: number;
    contratos: number;
  };
};

export type TerrenoListItem = Pick<
  Terreno,
  | "id"
  | "nome"
  | "cidade"
  | "uf"
  | "bairro"
  | "areaTerreno"
  | "status"
  | "formaPagamento"
  | "vgvEstimado"
  | "valorCompra"
  | "numUnidadesEstimado"
  | "prazoPagamento"
  | "createdAt"
  | "updatedAt"
> & {
  criador: Pick<Usuario, "id" | "nome">;
  responsavel: Pick<Usuario, "id" | "nome"> | null;
  diasNaEtapa?: number;
  score?: number;
};

export interface DashboardKPIs {
  terrenosEmNegociacao: number;
  propostasAtivas: number;
  contratosEmElaboracao: number;
  contratosAssinados: number;
  vgvTotalPipeline: number;
  valorTotalCompra: number;
  percentualMedioTerreno: number | null;
  totalUnidades: number;
}

export interface FunilEtapa {
  status: string;
  label: string;
  quantidade: number;
  vgv: number;
}

export interface CidadeStats {
  cidade: string;
  uf: string;
  terrenos: number;
  unidades: number;
  vgv: number;
}

export interface TempoMedioEtapa {
  status: string;
  label: string;
  diasMedio: number;
}
