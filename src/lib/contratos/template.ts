export interface Clausula {
  key: string;
  titulo: string;
  conteudo: string;
  historico: ClausulaHistoricoEntry[];
  analise?: AnaliseClausula | null;
}

export interface ClausulaHistoricoEntry {
  conteudoAnterior: string;
  conteudoNovo: string;
  autor: string;
  justificativa: string;
  data: string;
}

export interface AnaliseClausula {
  risco: "BAIXO" | "MEDIO" | "ALTO";
  explicacao: string;
  sugestao: string;
  dicasNegociacao: string;
  analisadoEm: string;
}

export interface ClausulasContrato {
  [key: string]: Clausula;
}

export function gerarClausulasIniciais(vars: Record<string, string> = {}): ClausulasContrato {
  const v = (key: string, fallback = "{{" + key + "}}") => vars[key] ?? fallback;

  const clausulas: Clausula[] = [
    {
      key: "partes",
      titulo: "Cláusula 1ª — Das Partes",
      conteudo: `PROMITENTE VENDEDOR(A): ${v("vendedor.nome")}, portador(a) do CPF/CNPJ nº ${v("vendedor.cpf_cnpj")}, residente/domiciliado(a) em ${v("vendedor.endereco", "endereço a informar")}, doravante denominado(a) simplesmente "VENDEDOR(A)".

PROMITENTE COMPRADORA: INC Empreendimentos, pessoa jurídica de direito privado, inscrita no CNPJ sob nº [CNPJ INC], com sede na [ENDEREÇO INC], doravante denominada simplesmente "INC" ou "COMPRADORA".`,
      historico: [],
      analise: null,
    },
    {
      key: "objeto",
      titulo: "Cláusula 2ª — Do Objeto",
      conteudo: `O presente instrumento tem por objeto a promessa de compra e venda do imóvel descrito como: ${v("terreno.endereco")}, com área total de ${v("terreno.area")} m², matriculado sob nº ${v("terreno.matricula", "a informar")} no ${v("terreno.cartorio", "Cartório de Registro de Imóveis competente")}, comarca de ${v("terreno.comarca", "a informar")}, doravante denominado "IMÓVEL".

O VENDEDOR(A) declara ser legítimo(a) proprietário(a) do imóvel acima descrito, com plena capacidade para alienar, livre e desembaraçado de quaisquer ônus, dívidas, hipotecas, penhoras, usufruto ou qualquer outro gravame real ou pessoal que impeça ou restrinja sua livre negociação.`,
      historico: [],
      analise: null,
    },
    {
      key: "preco",
      titulo: "Cláusula 3ª — Do Preço e Forma de Pagamento",
      conteudo: `O preço total da presente promessa de compra e venda é de ${v("valor", "R$ [VALOR]")} (${v("valor_extenso", "[valor por extenso]")}), que será pago na seguinte forma:

${v("forma_pagamento", "[Descrição detalhada da forma de pagamento, parcelas, datas de vencimento e condições]")}

Parágrafo Único: Os valores acima são fixos e irreajustáveis, salvo disposição expressa em contrário neste instrumento.`,
      historico: [],
      analise: null,
    },
    {
      key: "permuta",
      titulo: "Cláusula 4ª — Da Permuta (se aplicável)",
      conteudo: `Caso parte do preço seja pago por meio de permuta de unidades autônomas do empreendimento a ser construído no IMÓVEL, as unidades a serem entregues ao VENDEDOR(A) serão definidas em instrumento apartado ("Anexo de Permuta"), contendo: número, tipo, metragem e especificação das unidades; prazo para conclusão das obras e entrega; padrão de acabamento; e demais condições específicas.

A entrega das unidades permutadas está condicionada à obtenção de todas as licenças e aprovações necessárias à construção do empreendimento e ao registro da incorporação imobiliária, nos termos da Lei nº 4.591/64.

${v("descricao_permuta", "[Descrever aqui as unidades a serem permutadas, quantidades, tipologia e condições específicas]")}`,
      historico: [],
      analise: null,
    },
    {
      key: "condicoes_suspensivas",
      titulo: "Cláusula 5ª — Das Condições Suspensivas",
      conteudo: `A eficácia deste instrumento e a obrigação de pagamento do preço pela COMPRADORA ficam suspensas até o implemento cumulativo das seguintes condições:

I. Aprovação do projeto arquitetônico pelo órgão municipal competente, viabilizando a construção do empreendimento com as características necessárias à rentabilidade do negócio;

II. Registro da Incorporação Imobiliária no Cartório de Registro de Imóveis competente, nos termos da Lei nº 4.591/64;

III. Inexistência de quaisquer ônus, restrições ou impedimentos ao registro da escritura pública de compra e venda, após due diligence jurídica e documental satisfatória;

IV. Aprovação interna pelos órgãos deliberativos da INC Empreendimentos.

Parágrafo 1º: As condições acima deverão ser implementadas no prazo de ${v("prazo_condicoes", "180 (cento e oitenta) dias")} a contar da assinatura deste instrumento, prorrogável por igual período mediante notificação escrita.

Parágrafo 2º: O não implemento das condições no prazo estabelecido dará à COMPRADORA o direito de resilir o presente instrumento, sem qualquer ônus ou penalidade, restituindo-se ao VENDEDOR(A) o imóvel nas mesmas condições recebidas.`,
      historico: [],
      analise: null,
    },
    {
      key: "posse",
      titulo: "Cláusula 6ª — Da Posse",
      conteudo: `A posse direta do IMÓVEL será transferida à COMPRADORA na data da lavratura da escritura pública definitiva de compra e venda, após o implemento de todas as condições suspensivas previstas na Cláusula 5ª.

Até a transferência da posse, o VENDEDOR(A) obriga-se a:
(a) Manter o imóvel em perfeitas condições de conservação, livre de invasões ou ocupações de terceiros;
(b) Permitir o acesso da COMPRADORA e seus representantes ao imóvel para realização de vistorias, estudos e sondagens necessários;
(c) Não realizar quaisquer benfeitorias, construções ou demolições sem prévia e expressa anuência da COMPRADORA.`,
      historico: [],
      analise: null,
    },
    {
      key: "eviccao",
      titulo: "Cláusula 7ª — Da Evicção e Saneamento de Vícios",
      conteudo: `O VENDEDOR(A) responde pela evicção do IMÓVEL e pela existência de vícios ocultos, nos termos dos artigos 447 a 457 e 441 a 446 do Código Civil Brasileiro.

Parágrafo 1º: Em caso de evicção total ou parcial, o VENDEDOR(A) deverá ressarcir à COMPRADORA todos os valores pagos, acrescidos de correção monetária pelo IPCA e juros moratórios de 1% ao mês, além de perdas e danos.

Parágrafo 2º: O VENDEDOR(A) declara e garante que o IMÓVEL não está sujeito a qualquer ação judicial, processo de execução fiscal, embargo de obra, interdição administrativa ou qualquer outro gravame que possa prejudicar a sua livre negociação ou a realização do empreendimento.`,
      historico: [],
      analise: null,
    },
    {
      key: "passivos",
      titulo: "Cláusula 8ª — Dos Passivos e Débitos Anteriores",
      conteudo: `Todos os tributos, taxas, contribuições de melhoria, débitos de IPTU, tarifas de água, energia elétrica, gás e quaisquer outras obrigações relativas ao IMÓVEL, vencidos até a data da efetiva transferência da posse, são de responsabilidade exclusiva do VENDEDOR(A), que se obriga a quitá-los até essa data.

Parágrafo 1º: O VENDEDOR(A) responde por eventuais passivos ambientais existentes no IMÓVEL, incluindo contaminação do solo, passivos trabalhistas de vigilantes, caseiros ou empregados vinculados ao imóvel, e quaisquer débitos com o Poder Público.

Parágrafo 2º: Caso a COMPRADORA seja obrigada a pagar qualquer débito de responsabilidade do VENDEDOR(A), os valores desembolsados serão descontados do preço ainda a ser pago ou cobrados regressivamente, com acréscimo de 20% (vinte por cento) a título de indenização.`,
      historico: [],
      analise: null,
    },
    {
      key: "rescisao",
      titulo: "Cláusula 9ª — Da Rescisão e Cláusula Resolutiva",
      conteudo: `O presente instrumento poderá ser rescindido nas seguintes hipóteses:

I. Por inadimplemento do VENDEDOR(A): caso o VENDEDOR(A) descumpra qualquer obrigação aqui assumida, inclusive recuse-se a assinar a escritura definitiva, a COMPRADORA poderá exigir o cumprimento forçado ou a rescisão com pagamento de multa equivalente a ${v("multa_vendedor", "20% (vinte por cento)")} do valor total acordado, a título de perdas e danos, além de devolução de todos os valores eventualmente pagos;

II. Por inadimplemento da COMPRADORA: caso a COMPRADORA, após o implemento de todas as condições suspensivas, deixe de pagar as parcelas acordadas, o VENDEDOR(A) poderá exigir o cumprimento ou a rescisão com retenção de ${v("retencao_compradora", "10% (dez por cento)")} dos valores pagos, a título de compensação, devolvendo-se o saldo remanescente;

III. Por não implemento das condições suspensivas: conforme previsto na Cláusula 5ª, sem ônus para nenhuma das partes.`,
      historico: [],
      analise: null,
    },
    {
      key: "foro",
      titulo: "Cláusula 10ª — Do Foro",
      conteudo: `As partes elegem o Foro da Comarca de ${v("terreno.cidade", "[cidade do imóvel]")}, Estado do ${v("terreno.uf", "[UF]")}, para dirimir quaisquer dúvidas ou litígios decorrentes do presente instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

E por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença de 2 (duas) testemunhas abaixo identificadas.

${v("terreno.cidade", "[Cidade]")}, ${v("data_assinatura", "[data de assinatura]")}.`,
      historico: [],
      analise: null,
    },
  ];

  const result: ClausulasContrato = {};
  for (const c of clausulas) {
    result[c.key] = c;
  }
  return result;
}

export const CLAUSULAS_ORDEM = [
  "partes",
  "objeto",
  "preco",
  "permuta",
  "condicoes_suspensivas",
  "posse",
  "eviccao",
  "passivos",
  "rescisao",
  "foro",
];

export const CLAUSULAS_IMPORTANTES = [
  "condicoes_suspensivas",
  "eviccao",
  "passivos",
  "rescisao",
];
