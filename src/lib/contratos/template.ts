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
  const v = (key: string, fallback = "[" + key + "]") => vars[key] ?? fallback;

  const clausulas: Clausula[] = [
    {
      key: "partes",
      titulo: "1. Das Partes",
      conteudo: `1.1 Na qualidade de promitentes vendedores:

${v("vendedor.qualificacao", `${v("vendedor.nome")}, portador(a) do CPF/CNPJ nº ${v("vendedor.cpf_cnpj")}, ${v("vendedor.endereco_qualificacao", "[endereço completo, estado civil, profissão]")}`)}

As partes acima qualificadas declaram, sob as penas da lei, que se responsabilizam integralmente pela veracidade das informações prestadas, sendo doravante denominadas, em conjunto, simplesmente "PROPRIETÁRIOS".

1.2 Na qualidade de promissária compradora:

INC EMPREENDIMENTOS IMOBILIÁRIOS S/A., sociedade anônima aberta, inscrita no CNPJ/MF sob o n.º 09.611.768/0001-76, com sede na cidade de Juiz de Fora/MG na Rua Ataliba de Barros, n.º 182, Ed. Rossi 360 Business, sala n.º 1504, Bairro São Mateus, CEP 36.025-275, representada neste ato conforme seu Estatuto Social; ora denominada simplesmente "INC".`,
      historico: [],
      analise: null,
    },
    {
      key: "imovel",
      titulo: "2. Do Imóvel",
      conteudo: `2.1 Os PROPRIETÁRIOS declaram, neste ato, serem os legítimos proprietários e possuidores do imóvel adiante indicado, doravante denominado simplesmente "TERRENO":

${v("terreno.descricao", `Uma área de terras situada em ${v("terreno.endereco")}, com área de ${v("terreno.area")} m², matriculada sob nº ${v("terreno.matricula", "[nº da matrícula]")} no ${v("terreno.cartorio", "[Cartório de Registro de Imóveis competente]")}, Comarca de ${v("terreno.comarca", v("terreno.cidade"))}.`)}

2.2 Os PROPRIETÁRIOS manifestam interesse em vender, e a INC em adquirir o referido TERRENO, com a finalidade de nele desenvolver e lançar empreendimento imobiliário, doravante denominado simplesmente "EMPREENDIMENTO".

2.2.1 A efetivação da presente operação ficará condicionada à implementação das Condições Suspensivas e à não ocorrência das Condições Resolutivas previstas neste instrumento, observados os demais termos e condições aqui estipulados.

2.3 Os PROPRIETÁRIOS declaram que:

2.3.1 O TERRENO conta com infraestrutura compatível com a atividade a ser desenvolvida pela INC, incluindo, mas não se limitando a acesso viário, energia elétrica, abastecimento de água, coleta e disposição de esgoto e de drenagem pluvial, na extensão necessária para a plena implantação e operação do EMPREENDIMENTO. Declaram, ainda, que não há quaisquer impedimentos legais, técnicos ou administrativos que restrinjam ou inviabilizem a utilização do TERRENO para os fins pretendidos pela INC, e que, caso se verifique qualquer inadequação ou deficiência na infraestrutura necessária à atividade da INC, os PROPRIETÁRIOS comprometem-se a saná-la, às suas expensas, de forma a assegurar a plena utilização e operação do TERRENO conforme o planejado;

2.3.2 O TERRENO encontra-se livre e desembaraçado de quaisquer ônus reais ou pessoais, incluindo, mas não se limitando a penhor, hipoteca, anticrese, enfiteuse, usufruto, caução, servidão, direito de preferência, direito de passagem, direito real de garantia, opção de compra, promessa de compra e venda, direito de prioridade, ou qualquer outro direito, obrigação ou reivindicação de natureza semelhante;

2.3.3 O TERRENO não infringe quaisquer restrições, limitações, obrigações ou avenças de natureza contratual e não invade, sobrepõe-se ou afeta, de qualquer forma, imóveis pertencentes a terceiros;

2.3.4 O TERRENO não possui prolongamentos, acessões, benfeitorias ou melhorias que ultrapassem seus limites legais ou que estejam, ainda que parcialmente, situadas em terreno contíguos;

2.3.5 O TERRENO não está sujeito a servidões de qualquer natureza, tampouco há reivindicações, registros ou pretensões de estabelecimento de servidões sobre ele;

2.3.6 O TERRENO não está sujeito a quaisquer procedimentos administrativos, judiciais ou extrajudiciais que possam afetar sua posse, domínio ou uso, incluindo, mas não se limitando a processos de desapropriação, encampação, confisco, tombamento, declaração de utilidade pública ou interesse social, com ou sem indenização. Declaram, ainda, que o TERRENO não se situa em área considerada como entorno de bem tombado, nem é objeto de qualquer litígio, disputa ou reivindicação que possa impedir ou restringir sua utilização;

2.3.7 O TERRENO não se encontra em área de preservação ambiental, não possui passivo ambiental e não está sujeito a quaisquer restrições dessa natureza que impeçam ou limitem sua utilização. Declaram, ainda, desconhecer a existência de contaminações, infrações, danos ou riscos ambientais de qualquer natureza, inclusive aqueles decorrentes de atividades anteriores exercidas no TERRENO, por si ou por terceiros, bem como desconhecem a existência de qualquer procedimento administrativo, judicial ou extrajudicial, notificado, instaurado ou em curso, que trate de tais matérias. Declaram, por fim, que o TERRENO jamais abrigou atividades capazes de caracterizá-lo como contaminado ou potencialmente contaminado, nem apresenta risco à saúde humana ou ao meio ambiente, incluindo, mas não se limitando a aterros sanitários, depósitos de materiais radioativos, resíduos industriais, cemitérios, minerações, hospitais ou postos de combustíveis;

2.3.8 Todos os tributos, taxas, contribuições e demais encargos incidentes sobre o TERRENO encontram-se devidamente quitados perante as autoridades competentes;

2.3.9 Exercem a posse mansa, pacífica, contínua e incontestada do TERRENO, declarando, ainda, que não existem locatários, sublocatários, comodatários ou quaisquer terceiros que o ocupem, no todo ou em parte;

2.3.10 Não concederam a terceiros quaisquer opções, promessas de compra e venda ou direitos de aquisição, no todo ou em parte, sobre o TERRENO;

2.3.11 Que a assinatura, formalização e execução deste instrumento não configuram fraude contra credores, fraude à execução ou qualquer outra prática ilícita de natureza civil, comercial ou penal;

2.3.12 Sob as penas da lei civil e penal, declaram que não são sócios, acionistas, quotistas ou administradores de quaisquer sociedades empresárias ou simples em qualquer unidade da Federação, bem como que não figuram como partes em ações judiciais ou administrativas, de natureza real, pessoal ou reipersecutória, que possam comprometer a validade ou a eficácia deste instrumento; e

2.3.13 Responderão integralmente pela evicção de direito, na forma da lei.

2.4. Os PROPRIETÁRIOS obrigam-se a eliminar, às suas expensas e sem qualquer ônus para a INC, todo e qualquer gravame, ônus, restrição ou intercorrência que venha a ser constatado após a assinatura deste instrumento, comprometendo-se a adotar imediatamente todas as providências necessárias tão logo sejam cientificadas pela INC ou por terceiros, garantindo, assim, a plena e livre disposição do TERRENO.`,
      historico: [],
      analise: null,
    },
    {
      key: "objeto_preco",
      titulo: "3. Do Objeto da Compra e Venda e Suas Condições",
      conteudo: `3.1 Constitui objeto deste instrumento o compromisso entre as Partes de compra e venda do TERRENO, uma vez superadas todas as condições suspensivas e precedentes elencadas na Cláusula Quinta e diante da não ocorrência das condições resolutivas deste instrumento, com a finalidade única de se promover a realização do EMPREENDIMENTO pela INC ou empresa por ela controlada ou a ela coligada, nos moldes a serem estabelecidos a seu exclusivo critério, após os estudos jurídicos, técnicos e econômico-financeiros pertinentes.

3.2 Para todos os efeitos deste contrato, considera-se:

(i) ("EMPREENDIMENTO"): Condomínio Especial ou Edilício a ser comercializado por meio de incorporação imobiliária, nos termos da Lei nº 4.591/64, com execução financiada pelo Programa Minha Casa, Minha Vida (ou outro que venha a substituí-lo), ou a critério da INC, por outra modalidade de financiamento habitacional, sempre sob exclusiva responsabilidade da INC;

(ii) ("AGENTE FINANCIADOR"): Instituição ou Entidade responsável pelos recursos financeiros destinados ao financiamento à produção do EMPREENDIMENTO;

(iii) ("FINANCIAMENTO À PRODUÇÃO"): Operação de crédito contratada pela INC junto ao agente financiador, destinada ao custeio da construção do EMPREENDIMENTO, abrangendo a liberação de recursos em conformidade com a evolução da obra. O financiamento poderá incluir a vinculação de garantias reais (hipoteca ou alienação fiduciária do terreno e das futuras unidades), até a quitação integral da operação;

(iv) ("MEDIÇÃO"): Procedimento de aferição, mediante vistoria dos serviços executados na obra do EMPREENDIMENTO, realizado pelo agente financiador com a finalidade de autorizar a liberação dos valores provenientes dos repasses correspondentes aos financiamentos dos adquirentes;

(v) ("EVENTO DE PAGAMENTO"): Cada transferência de valores da INC aos PROPRIETÁRIOS constituirá um evento de pagamento.

3.3 Por este instrumento e na melhor forma de direito, os PROPRIETÁRIOS, prometem vender o TERRENO à INC, e esta, por sua vez, promete pagar àqueles o montante correspondente ao "PREÇO", da seguinte forma:

${v("forma_pagamento", "[Descrever detalhadamente a forma de pagamento: parcelas, datas, condições, vinculação a eventos de medição ou outros marcos contratuais]")}

3.4 Os valores serão pagos mensalmente, na forma e nos prazos estabelecidos neste instrumento, sendo que o atraso no pagamento sujeitará o devedor à multa moratória não compensatória de 1% (um por cento) sobre o valor em atraso, acrescida de juros de mora de 1% (um por cento) ao mês, calculados pro rata die.

3.4.1 Os pagamentos serão efetuados por meio de depósito/transferência em conta corrente de titularidade dos PROPRIETÁRIOS a ser futuramente indicada, valendo o comprovante de transferência ou depósito como prova de pagamento e quitação, constituindo-se cada transferência de valores um EVENTO DE PAGAMENTO.

3.5 Para todos os efeitos deste Contrato, as partes atribuem ao TERRENO o valor total de ${v("valor", "R$ [VALOR]")} (${v("valor_extenso", "[valor por extenso]")}).`,
      historico: [],
      analise: null,
    },
    {
      key: "documentacao",
      titulo: "4. Da Documentação",
      conteudo: `4.1 Os PROPRIETÁRIOS deverão providenciar e apresentar à INC, no prazo de 60 (sessenta) dias contados da assinatura deste instrumento, todos os documentos relacionados no "ANEXO I", obtidos junto aos órgãos competentes do local ou comarca em que se situa o TERRENO, sua respectiva capital, bem como o domicílio de cada pesquisado e sua respectiva capital.

4.2 Após o recebimento integral dos documentos referidos no item anterior, em até 90 (noventa) dias contados da entrega do último documento, a INC procederá à análise jurídica da documentação, podendo:

a) Validar a documentação, considerando-se cumprida a condição suspensiva prevista no item 5.1, alínea "a";

b) Rejeitar a documentação, de forma justificada, caso em que este Contrato será considerado resolvido, retornando as partes ao status quo ante, sem multas ou indenizações, permanecendo os PROPRIETÁRIOS com o TERRENO no estado em que se encontrar;

c) Solicitar esclarecimentos ou documentos complementares, hipótese em que o novo parecer deverá ser emitido em até 30 (trinta) dias após a complementação, optando-se, então, por uma das alternativas das alíneas "a" ou "b".

4.3 Caso qualquer certidão apresentada seja positiva, os PROPRIETÁRIOS deverão, concomitantemente, apresentar a respectiva certidão esclarecedora ("certidão de fatos" ou "certidão de objeto e pé"), emitida pelo órgão competente, contendo o objeto, valor envolvido, partes, fase processual, andamento e, se houver, a descrição do bem penhorado.

4.4 A INC poderá solicitar, a qualquer tempo, documentos adicionais para esclarecer dúvidas ou apontamentos constantes das certidões ou documentos apresentados, bem como exigir a apresentação de documentação relativa a outros bens imóveis livres e desembaraçados dos PROPRIETÁRIOS, visando garantir eventual execução.

4.5 A não apresentação integral dos documentos exigidos, a existência de irregularidades, débitos ou qualquer medida que comprometa a segurança do negócio implicará na suspensão do pagamento das parcelas e dos efeitos deste Contrato, se for o caso, até a completa regularização, salvo autorização expressa da INC, que poderá, a seu critério, considerar o Contrato resolvido por descumprimento, nos termos da Cláusula "Condições Resolutivas".

4.6 Mesmo após a escrituração do TERRENO, caso o agente financiador, ou eventual órgão público, venha a questionar pendência na documentação dos PROPRIETÁRIOS ou do TERRENO, os PROPRIETÁRIOS se obrigam a regularizá-la e esclarecê-la até sua completa solução.

4.7 Os documentos previstos no "ANEXO I" deverão ser atualizados pelos PROPRIETÁRIOS por ocasião da outorga das escrituras referidas nos itens 6.2 e 6.2.1, mantendo-se válidos e atualizados até o efetivo registro da transferência no Ofício de Registro de Imóveis competente.

4.8 A demora injustificada na disponibilização da documentação, ou a verificação de pendências que impeçam a contratação do financiamento à produção do EMPREENDIMENTO junto ao agente financiador, facultará à INC a rescisão do contrato sem ônus para as partes.

4.9 O não cumprimento, pelos PROPRIETÁRIOS, dos prazos estabelecidos nesta Cláusula ou de 30 (trinta) dias contados da solicitação de documentos adicionais, acarretará multa de R$ 100,00 (cem reais) por dia de atraso. Havendo justificativa aceita por escrito pela INC, o prazo poderá ser prorrogado e a multa afastada.`,
      historico: [],
      analise: null,
    },
    {
      key: "condicoes_suspensivas",
      titulo: "5. Das Condições Suspensivas",
      conteudo: `5.1 Os prazos e efeitos desta Promessa de Compra e Venda somente terão início após o cumprimento cumulativo, ainda que não sucessivo, das seguintes condições:

a) Entrega e aprovação documental (Due Diligence): Recebimento de todos os documentos mencionados no "ANEXO I" deste instrumento e aprovação destes pela INC, observando-se a forma e os prazos fixados na Cláusula Quarta;

b) Aprovação societária: Aprovação, pelo Conselho de Administração da INC, da operação imobiliária prevista neste contrato;

c) Levantamento topográfico: Realização pela INC de levantamento planialtimétrico e cadastral atualizado, para verificação da área e confrontações declaradas neste instrumento; eventuais divergências poderão ensejar a revisão das condições pactuadas ou, a critério da INC, a resolução do negócio;

d) Estudo geotécnico e ambiental: Verificação das condições do solo e subsolo, mediante sondagens e análises técnicas, para confirmação do custo de fundações e de inexistência de contaminações químicas, biológicas ou radioativas, bem como de possíveis passivos ambientais que impeçam ou onerem o EMPREENDIMENTO;

e) Análise urbanística preliminar: Verificação de documento de orientação prévia para construção expedido pela municipalidade, confirmando que o TERRENO admite construção residencial multifamiliar, sem restrições impeditivas e com potencial construtivo compatível com os objetivos da INC;

f) Limitação de contrapartidas e obras públicas: Confirmação de que as contrapartidas e/ou obras exigidas pelo Poder Público ou por concessionárias não excedem 5% (cinco por cento) do valor total do negócio;

g) Outorga onerosa (quando aplicável): Confirmação de que o valor de eventual outorga onerosa e demais contrapartidas financeiras exigidas pelo Poder Público não ultrapassam o orçamento previsto nos estudos de viabilidade da INC;

h) Ausência de passivo ou restrição ambiental: Verificação e confirmação da inexistência de passivos, restrições ou responsabilidades de natureza ambiental incidentes sobre o TERRENO, bem como de contaminações, atividades pretéritas ou instalações que possam representar risco ao meio ambiente, à saúde pública ou aos futuros usuários do EMPREENDIMENTO — incluindo, entre outros, a presença de aterros sanitários, indústrias químicas, depósitos de resíduos tóxicos, postos de combustíveis, Áreas de Preservação Permanente (APP), Reserva Legal (RL), Unidades de Conservação (UC) ou quaisquer outras limitações ambientais aplicáveis;

i) Restrições construtivas: Verificação e confirmação da inexistência de restrições de uso, limitações construtivas, faixas non aedificandi, servidões, sobreposições com áreas públicas ou quaisquer outros gravames ou fatores que impeçam ou limitem a implantação dos EMPREENDIMENTOS;

j) Mitigação de riscos externos: Verificação de litígios, pendências judiciais, disputas possessórias, ações civis públicas, tombamentos, restrições administrativas ou qualquer outro fator que possa atrasar, inviabilizar ou onerar o EMPREENDIMENTO;

k) Regularização registral (a cargo dos PROPRIETÁRIOS): Conclusão da regularização registral do imóvel, mediante o registro dos formais de partilha e a realização de procedimento de retificação de registro perante o Ofício de Registro de Imóveis competente, inclusive para correção e/ou complementação de medidas, confrontações e demais elementos necessários à plena identificação do imóvel e à consolidação de sua titularidade;

l) Regularização fundiária ou urbanística (quando aplicável): Conclusão de regularização fundiária complementar ou de aprovação urbanística, incluindo, sem limitação, a aprovação de parcelamento do solo, de forma a assegurar que o(s) imóvel(is) esteja(m) apto(s) ao licenciamento para construção perante os órgãos competentes, em todas as esferas administrativas;

m) Aprovação do projeto e licenciamento: Aprovação, pela municipalidade, do projeto arquitetônico do EMPREENDIMENTO, com no mínimo ${v("min_unidades", "778 (setecentas e setenta e oito)")} unidades autônomas, bem como a emissão do respectivo Alvará de Construção;

n) Licenças e autorizações complementares: Viabilidade de obtenção de todas as licenças, autorizações e aprovações necessárias junto aos órgãos públicos e concessionárias competentes (inclusive ambientais, de trânsito, saneamento, energia, ANAC, CINDACTA, COMAER, entre outros), sem restrições impeditivas;

o) Financiamento e programas habitacionais: Possibilidade de obtenção de linha de crédito para financiamento à produção do EMPREENDIMENTO, junto a instituição financeira, vinculada ao Programa Minha Casa Minha Vida (ou programa equivalente vigente), incluindo a manutenção das normas, subsídios e regras de utilização do FGTS;

p) Viabilidades e estudos: Verificação e confirmação da inexistência de óbices legais, técnicos, urbanísticos, ambientais, financeiros ou de mercado que inviabilizem a aprovação, registro, execução ou comercialização do EMPREENDIMENTO, bem como a conclusão dos estudos jurídicos, técnicos, urbanísticos, ambientais e econômico-financeiros necessários, com consequente certificação da viabilidade do EMPREENDIMENTO.

5.2 Caso qualquer das condições suspensivas previstas no item 5.1 não seja integralmente cumprida ou superada, a INC poderá, a seu exclusivo critério, considerar este contrato resolvido de pleno direito, sem necessidade de notificação judicial ou extrajudicial, retornando as partes ao status quo ante, sem que seja devida qualquer multa, indenização ou compensação por parte de qualquer das partes, permanecendo os PROPRIETÁRIOS na posse do TERRENO no estado em que se encontrar.`,
      historico: [],
      analise: null,
    },
    {
      key: "posse_escrituras",
      titulo: "6. Da Posse e das Escrituras",
      conteudo: `6.1 A INC fica, neste ato, autorizada a ingressar no TERRENO, tantas vezes quantas sejam necessárias, para a realização dos trabalhos de prospecção, elaboração de projetos, levantamento topográfico, sondagens, medições e instalações de placas, podendo, ainda, colocar tapumes de obra e construir o apartamento modelo e o stand de vendas, enfim, adotar todas as medidas que se fizerem necessárias para a execução dos estudos e levantamentos técnicos voltados ao desenvolvimento e à elaboração dos projetos do EMPREENDIMENTO, sem que tal autorização implique, em hipótese alguma, transferência de posse, a qual somente se dará com a outorga da Escritura Pública de Compra e Venda, que transferirá domínio, posse, direito e ação do TERRENO à INC.

6.1.1 Os PROPRIETÁRIOS serão responsáveis pela manutenção da segurança do TERRENO e de sua posse, bem como pelo pagamento de todos os tributos, taxas ou notificações da Prefeitura Municipal sobre ele incidentes até a data da transferência da posse, ainda que lançados posteriormente, se decorrentes de fatos geradores pretéritos, desde que não tenham sido originados por culpa da INC. Após a transferência da posse, passará a INC a arcar com todos os encargos referentes ao TERRENO.

6.2 No prazo de até 10 (dez) dias, contados da comunicação enviada pela INC aos PROPRIETÁRIOS, desde que superadas as condições suspensivas elencadas na Cláusula Quinta deste instrumento, os PROPRIETÁRIOS outorgarão em favor da INC ou de Sociedade por ela controlada ou a ela coligada, a exclusivo critério desta, Escritura Pública de Compra e Venda do TERRENO (livre e desimpedido de coisas e pessoas), com quitação plena do PREÇO ajustado, por meio de nota promissória emitida em caráter "pro soluto", no valor previsto no item 3.5 deste instrumento.

6.2.1 Em ato concomitante à outorga da Escritura Pública de Compra e Venda do TERRENO, prevista no item 6.2 acima, em substituição à nota promissória (que será resgatada pela INC), será outorgada Escritura Pública de Confissão de Dívida com Promessa de Pagamento, na qual a INC se comprometerá a efetuar o pagamento da dívida de maneira parcelada, nos termos da Cláusula Terceira deste instrumento, escritura esta que não será levada a registro pelas Partes.

6.2.2 Caso os PROPRIETÁRIOS se recusem ou tornem, por ato ou omissão, impossível a outorga das escrituras mencionadas nos itens 6.2 e 6.2.1 acima, será devida multa em favor da INC, desde já arbitrada em 10% (dez por cento) do valor definido no item 3.5 acima, sem prejuízo das perdas e danos eventualmente apurados, além do reembolso dos valores eventualmente pagos pela INC, inclusive em virtude da Cláusula Terceira deste instrumento.

6.2.3 Todos os custos inerentes às lavraturas das escrituras mencionadas nos itens 6.2 e 6.2.1 acima, tais como ITBI, emolumentos de cartório, taxas, certidões etc., serão suportados pela INC.

6.2.4 Quaisquer das escrituras mencionadas nos itens 6.2 e 6.2.1 acima serão lavradas em Tabelionato de Notas de escolha da INC, no prazo de 10 (dez) dias a contar da solicitação enviada pela INC aos PROPRIETÁRIOS. Para tanto, os PROPRIETÁRIOS deverão apresentar todos os documentos necessários e exigíveis para a referida outorga.

6.2.5 O atraso dos PROPRIETÁRIOS na outorga da Escritura Pública de Compra e Venda ensejará o pagamento de multa mensal no importe de 1% (um por cento) do valor definido no item 3.5 deste instrumento, em favor da INC, devida desde o inadimplemento até a data da efetiva outorga, e/ou da resolução do presente Contrato, a critério da INC.

6.2.6 Caso as escrituras não sejam outorgadas por motivo atribuível à INC, os prazos previstos neste instrumento serão suspensos até a outorga e não haverá incidência de qualquer penalidade prevista neste instrumento.

6.3 A inadimplência dos PROPRIETÁRIOS, consistente na recusa à outorga da Escritura Pública de Compra e Venda, ensejará o direito da INC em proceder com o pedido de adjudicação compulsória do TERRENO, na forma da lei, além de outras medidas cabíveis para o recebimento de indenizações por perdas e danos que venham a ser causados em razão da citada recusa.

6.4 A INC será imitida na posse definitiva do TERRENO após a outorga das escrituras mencionadas nos itens 6.2 e 6.2.1 acima, devendo o TERRENO estar desocupado, na forma abaixo.

6.4.1 Caso o TERRENO não se encontre livre de coisas, desocupado de pessoas ou quaisquer outros óbices no prazo acima estipulado, os PROPRIETÁRIOS serão responsáveis pela respectiva desocupação, arcando nesse caso com os custos decorrentes desta, com todas as contas e tributos incidentes sobre o TERRENO até a efetiva desocupação, bem como com quaisquer custos e responsabilidades decorrentes de eventuais medidas judiciais relativas à defesa da posse ou de reivindicação da propriedade perante terceiros.

6.4.2 Ocorrendo o disposto no item anterior, os PROPRIETÁRIOS arcarão, ainda, com o pagamento, em favor da INC, de quantia equivalente a 1% (um por cento) do valor definido no item 3.5, além de R$ 10.000,00 (dez mil reais) por mês ou fração de mês até a efetiva desocupação, sendo que quaisquer pagamentos e prazos oriundos do presente Contrato ficarão suspensos até a efetiva desocupação.

6.5 Os PROPRIETÁRIOS têm ciência e concordam que, independentemente de celebração de aditivo, a critério exclusivo da INC, esta poderá transferir quaisquer direitos e obrigações a esta atribuídos neste Contrato a uma sociedade de propósito específico – SPE do grupo econômico que será responsável pela execução do EMPREENDIMENTO.`,
      historico: [],
      analise: null,
    },
    {
      key: "empreendimento",
      titulo: "7. Dos Empreendimentos e da Incorporação Imobiliária",
      conteudo: `7.1 A INC pretende executar, sobre o TERRENO, empreendimento imobiliário ("EMPREENDIMENTO"), nos termos da Lei nº 4.591/64, conforme projeto arquitetônico a ser aprovado pela Prefeitura Municipal e demais órgãos competentes.

7.2 Competirá a INC, ou quem esta indicar, promover a comercialização das unidades do EMPREENDIMENTO de acordo com suas diretrizes comerciais, sendo os valores, condições de vendas e planos de pagamento estabelecidos a seu exclusivo critério, sem necessidade de ciência prévia ou aprovação dos PROPRIETÁRIOS.

7.3 A INC elaborará os estudos preliminares do TERRENO com objetivo de verificar a viabilidade técnica, jurídica e financeira para o desenvolvimento do EMPREENDIMENTO pretendido.

7.4 A INC será a única e exclusiva responsável pela execução da obra do EMPREENDIMENTO, bem como por todos os custos a ela relacionados, podendo executá-la diretamente ou por meio da contratação de terceiros, nos termos da legislação vigente.

7.5 A INC obriga-se a levar a obra a bom termo, em conformidade com o memorial descritivo aprovado pelo agente financiador, bem como com o projeto arquitetônico a ser aprovado pela municipalidade e demais órgãos competentes. Fica certo que caberá única e exclusivamente à INC a escolha do método construtivo a ser adotado.

7.6 Os PROPRIETÁRIOS comprometem-se a outorgar, seja por instrumento público ou particular, no prazo de 10 (dez) dias, contados da solicitação da INC, procuração com poderes específicos em favor da equipe técnica da INC, ou de quem esta indicar, para que possam providenciar e assinar todos os documentos, requerimentos e autorizações necessários à viabilização e aprovação dos projetos referentes à construção do EMPREENDIMENTO, bem como para a prática de todos os demais atos indispensáveis à consecução dessa finalidade.

7.7 Todos os custos de construção, técnicos, financeiros e administrativos para viabilizar a implantação e desenvolvimento do EMPREENDIMENTO até seu final serão suportados inteira e exclusivamente pela INC, com ela não concorrendo os PROPRIETÁRIOS.

7.8 O Projeto de Construção poderá ser modificado pela INC antes de sua aprovação ou mesmo após sua aprovação ou, ainda, no decorrer de sua execução, por razões de ordem técnica, mercadológica ou decorrente do planejamento econômico-financeiro. Os custos relativos às eventuais modificações de Projeto de Construção na sua feição original, de qualquer natureza, inclusive os de sua aprovação, serão de única e exclusiva responsabilidade da INC.

7.9 A INC poderá, a seu exclusivo critério, optar pela contratação de financiamento à produção para execução da obra do EMPREENDIMENTO, figurando como única devedora e responsável pelo pagamento integral de eventual empréstimo ou obrigação assumida. Caso não opte pelo referido financiamento, a INC executará a obra com recursos próprios ou obtidos por outros meios legítimos de financiamento.

7.10 Na hipótese de a INC optar pela contratação do financiamento à produção junto a agente financiador — o que implica na constituição de hipoteca ou de alienação fiduciária do TERRENO e de suas respectivas acessões e benfeitorias em favor do agente financiador —, os PROPRIETÁRIOS obrigam-se a outorgar sua expressa anuência, sempre que necessária, permanecendo isentos de quaisquer custos, encargos ou responsabilidades decorrentes. Em caso de rescisão, a INC deverá restituir o TERRENO livre e desembaraçado de qualquer ônus.

7.11 Fica desde já ajustado que o EMPREENDIMENTO poderá ser executado em fases ou módulos, a exclusivo critério da INC ou por resolução do agente financiador.

7.12 No prazo de 04 (quatro) meses, contados da superação cumulativa das condições suspensivas, a INC deverá concluir o protocolo de aprovação do projeto arquitetônico do EMPREENDIMENTO, perante a Municipalidade e demais órgãos públicos competentes.

7.13 O início do procedimento de outorga das escrituras referidas nos itens 6.2 e 6.2.1 deverá ocorrer no prazo de até 30 (trinta) dias contados da aprovação do projeto arquitetônico perante a Municipalidade, e desde que tenham sido emitidas todas as licenças necessárias à execução do EMPREENDIMENTO.

7.14 O registro de incorporação imobiliária do EMPREENDIMENTO deverá ser protocolizado perante o Ofício de Registro de Imóveis competente no prazo de até 30 (trinta) dias contados da outorga das escrituras referidas nos itens 6.2 e 6.2.1, e desde que tenham sido emitidas todas as licenças necessárias à execução do EMPREENDIMENTO.

7.14.1 Com o objetivo de assegurar o cumprimento da Escritura Pública de Confissão de Dívida e a efetiva implementação do EMPREENDIMENTO, a INC se obriga a averbar a AFETAÇÃO DO PATRIMÔNIO, nos termos da Lei Federal nº 10.931/2004.

7.15 Todas as obrigações relativas à incorporação imobiliária caberão exclusivamente à INC, ficando os PROPRIETÁRIOS absolutamente isentos de quaisquer responsabilidades, comprometendo-se a INC a mantê-los sempre a salvo de toda e qualquer implicação legal decorrente dessa atividade.

7.16 Nos termos do artigo 34 da Lei nº 4.591/64, nos primeiros 180 (cento e oitenta) dias após cada registro de incorporação imobiliária, poderá a INC cancelar o(s) registro(s) e desistir da(s) incorporação(ões), podendo, a seu exclusivo critério:

a) manter incorporado o TERRENO do EMPREENDIMENTO, dando seguimento ao presente Contrato, ou;
b) não manter incorporado o TERRENO do EMPREENDIMENTO, formalizando sua desistência mediante requerimento ao Oficial Registrador.

7.16.1 Para fins de regulamentação do disposto no item 7.16 "b", considerando a possibilidade de a(s) incorporação(ões) não ser(em) concretizada(s), as Partes ajustam que:

a) Perante terceiros: todas as quantias efetivamente recebidas em razão da comercialização das unidades autônomas serão restituídas aos adquirentes, exclusivamente pela INC, nos termos da legislação vigente;

b) Perante os PROPRIETÁRIOS: o presente Contrato será considerado rescindido de pleno direito, sem aplicação de qualquer penalidade. Alternativamente, as Partes, de comum acordo, poderão manter a eficácia do Contrato, optando por realizar novo lançamento de produto imobiliário similar, no prazo de até 6 (seis) meses contados da referida desistência, hipótese em que permanecerão válidas todas as cláusulas e condições originalmente estipuladas.

7.16.2 Caso a INC opte por resolver este Contrato, esta será a única responsável por toda e qualquer despesa que venha a suportar advinda de tal resolução, inclusive, os valores a título de ITBI e emolumentos dos Cartórios de Notas e Registro de Imóveis, necessários para a devolução do TERRENO para os PROPRIETÁRIOS.

7.17 O lançamento do EMPREENDIMENTO deverá ser realizado no prazo de 90 (noventa) dias, contados do registro da incorporação imobiliária, desde que tenha sido contratado o financiamento à produção, enquadrado no âmbito do Programa Minha Casa, Minha Vida (ou de outro que venha a substituí-lo), ou, a critério da INC, por outra modalidade financiamento habitacional.

7.18 Para todos os efeitos deste contrato, considera-se como contratação do financiamento à produção do EMPREENDIMENTO, junto ao agente financiador, a data em que o respectivo contrato for devidamente registrado perante o Ofício de Registro de Imóveis competente e, cumulativamente, estiverem integralmente superadas todas as condições suspensivas previstas neste instrumento.`,
      historico: [],
      analise: null,
    },
    {
      key: "mandato",
      titulo: "8. Do Mandato",
      conteudo: `8.1 Sem prejuízo da obrigação prevista no item 7.6, os PROPRIETÁRIOS, pelo presente instrumento, outorgam à INC poderes específicos para representá-los, na qualidade de proprietários do TERRENO, perante a Prefeitura Municipal, demais órgãos e secretarias públicas, autarquias, concessionárias de serviços públicos, serventias extrajudiciais, em especial perante o competente Ofício de Registro de Imóveis, com a finalidade de promover a aprovação dos projetos arquitetônicos e complementares, averbar e registrar o que se fizer necessário, podendo a INC praticar todos os atos indispensáveis ao pleno cumprimento deste Contrato e ao desenvolvimento da incorporação imobiliária e da execução do EMPREENDIMENTO.`,
      historico: [],
      analise: null,
    },
    {
      key: "despesas",
      titulo: "9. Das Despesas",
      conteudo: `9.1 Todas as despesas com escrituras, impostos, emolumentos e registros imobiliários correrão por conta exclusiva da INC, assim como todos os ônus e encargos decorrentes desta transação, dos empreendimentos e da construção, de qualquer natureza, incluindo, entre outros, trabalhistas, previdenciários, fiscais e tributários.

9.2 Caso os PROPRIETÁRIOS deixem de efetuar, nos prazos estipulados neste Contrato, o pagamento de valores que sejam de sua responsabilidade, a INC poderá, para resguardar o negócio, efetuar o pagamento em caráter de direito de regresso, ficando ajustado entre as Partes que sobre o valor adiantado incidirá correção monetária até o efetivo reembolso.`,
      historico: [],
      analise: null,
    },
    {
      key: "condicoes_resolutivas",
      titulo: "10. Das Condições Resolutivas",
      conteudo: `10.1 A INC poderá, a seu exclusivo critério, promover a resolução deste Contrato, mediante notificação aos PROPRIETÁRIOS, na ocorrência de qualquer das hipóteses abaixo, ou de outros fatos que impeçam, comprometam ou onerem de forma relevante o desenvolvimento imobiliário pretendido no TERRENO, a execução das obras ou as contratações junto ao agente financiador, incluindo, mas não se limitando a:

a) Impossibilidade de superação de quaisquer condições suspensivas que comprometam a viabilidade técnica, econômica, jurídica, ambiental ou urbanística do EMPREENDIMENTO;

b) Falsidade, inexatidão ou omissão em declarações, informações ou documentos apresentados no âmbito deste Contrato;

c) Identificação, em processo de Due Diligence, de situações que impeçam ou onerem excessivamente, tais como ações judiciais, processos administrativos, disputas possessórias, passivos ambientais, restrições, gravames ou ônus incidentes sobre o TERRENO ou sobre os PROPRIETÁRIOS;

d) Reprovação, pelo Conselho de Administração da INC, da operação imobiliária prevista neste Contrato;

e) Constatação, em levantamento topográfico, vistoria técnica ou inspeção in loco, de divergências com a matrícula, condições desfavoráveis, invasões, ocupações irregulares ou ameaças de ocupação no TERRENO;

f) Existência de restrições de uso, limitações construtivas, faixas non aedificandi, servidões, sobreposições com áreas públicas ou outros gravames que limitem a implantação do EMPREENDIMENTO;

g) Constatação de lençol freático superficial, rochas, aterros, resíduos ou outras condições geológicas adversas, ou ainda de características físicas que resultem em onerosidade excessiva para a execução das fundações, contenções, terraplenagem ou estrutura do EMPREENDIMENTO, ou que, de qualquer modo, atrasem, comprometam ou inviabilizem sua implantação;

h) Identificação de contaminação do solo ou subsolo, presença de passivos ambientais ou restrições de uso de natureza ambiental, urbanística ou legal, que impeçam, limitem ou onerem a implantação do EMPREENDIMENTO, tais como Áreas de Preservação Permanente (APP), Reserva Legal (RL), Unidades de Conservação (UC), Unidade de Proteção e Incremento Ambiental (UPIA), faixas de domínio público, áreas contaminadas, aterros sanitários, indústrias potencialmente poluidoras, depósitos de resíduos, ou quaisquer outras zonas sujeitas a restrições ambientais ou limitações de uso previstas na legislação aplicável;

i) Existência de passivos, restrições ou responsabilidades ambientais que representem risco ao meio ambiente, à saúde pública, aos futuros usuários ou que inviabilizem a contratação de financiamento;

j) Contrapartidas ou exigências do Poder Público ou de concessionárias que excedam 5% (cinco por cento) do valor do negócio previsto neste instrumento;

k) Outorga onerosa, quando aplicável, ou outras contrapartidas financeiras exigidas pelo Poder Público que ultrapassem o orçamento previsto nos estudos de viabilidade da INC;

l) Impossibilidade de regularização registral, fundiária ou urbanística, complementares ou não, quando aplicável, que inviabilize o licenciamento do imóvel para construção;

m) Impossibilidade de ocupação residencial multifamiliar ou de verticalização com obtenção de, no mínimo, ${v("min_unidades", "778 (setecentas e setenta e oito)")} unidades autônomas, ou constatação de restrições impeditivas e incompatíveis com o objetivo da INC;

n) Impossibilidade de obtenção de licenças, autorizações, aprovações de projetos ou alvarás indispensáveis à execução ou comercialização do EMPREENDIMENTO;

o) Impossibilidade de lavratura da escritura de compra e venda definitiva mencionada neste Contrato, em favor da INC;

p) Impossibilidade de obtenção de financiamento ou linhas de crédito que viabilizem a produção do EMPREENDIMENTO, inclusive no âmbito de programas habitacionais federais (como o Programa Minha Casa, Minha Vida, ou equivalente), considerando o fluxo financeiro, o Valor Geral de Vendas (VGV) e a rentabilidade esperada;

q) Alterações legislativas municipais, estaduais ou federais, ou outros eventos fora do controle das partes, que impactem negativamente o potencial construtivo, zoneamento, Plano Diretor ou diretrizes urbanísticas aplicáveis; ou revogação de regularizações indispensáveis à implantação do EMPREENDIMENTO;

r) Viabilidade Global: Identificação de óbices legais, técnicos, urbanísticos, ambientais, financeiros ou de mercado que inviabilizem a aprovação, registro, execução, comercialização ou o desenvolvimento imobiliário pretendido no TERRENO.

10.2 Optando a INC pela rescisão contratual em razão da ocorrência de qualquer das condições resolutivas previstas no item acima, retornarão as Partes ao status quo ante, não sendo devida indenização, multa ou penalidade de qualquer natureza.

10.3 Independentemente do motivo que resulte na resilição ou invalidade do presente Contrato, caso já tenha sido lavrada a escritura de confissão de dívida mencionada no item 6.2.1 deste instrumento, a dívida confessada será obrigatoriamente quitada mediante dação em pagamento do TERRENO, no estado em que se encontrar, salvo se a INC optar pela permanência do TERRENO em sua propriedade, hipótese em que as Partes deverão pactuar nova forma de pagamento.

10.4 Nos termos desta Cláusula, caberá à INC arcar com todas as despesas necessárias à devolução do TERRENO aos PROPRIETÁRIOS, incluindo, mas não se limitando, aos valores referentes a ITBI, custas e emolumentos de Cartórios de Notas e de Registro de Imóveis.

10.5 A devolução efetiva do TERRENO ocorrerá após a restituição, pelos PROPRIETÁRIOS à INC, dos valores eventualmente quitados ou antecipados pela INC em razão do pagamento do PREÇO, bem como tributos, taxas ou encargos incidentes sobre o TERRENO.

10.5.1 A restituição referida neste item deverá ser efetuada no prazo máximo de 30 (trinta) dias, contados da data da rescisão, podendo ocorrer por devolução direta ou compensação entre as Partes.`,
      historico: [],
      analise: null,
    },
    {
      key: "irrevogabilidade",
      titulo: "11. Da Irrevogabilidade e Irretratabilidade",
      conteudo: `11.1 Este Contrato, ressalvadas as condições suspensivas e as hipóteses de resolução expressamente previstas, é celebrado em caráter irrevogável e irretratável, obrigando as Partes, seus herdeiros e sucessores, a qualquer título, e constituindo título executivo extrajudicial, nos termos da legislação aplicável.`,
      historico: [],
      analise: null,
    },
    {
      key: "comunicacoes",
      titulo: "12. Das Comunicações",
      conteudo: `12.1. A exigência de cumprimento das obrigações previstas neste Contrato será feita, para todos os efeitos legais, por meio de correspondência com protocolo de recebimento, enviada à Parte contrária nos endereços indicados na Cláusula Primeira deste instrumento, concedendo-se o prazo de 30 (trinta) dias, contados do recebimento, para que sejam cumpridos seus termos.

12.1.1. Para os fins deste item, os PROPRIETÁRIOS nomeiam e constituem, como seu representante, a pessoa abaixo indicada, de forma que qualquer aviso ou notificação entregue a ela ou por ela, será considerado regular e efetivamente cumprido para todos os efeitos legais.

REPRESENTANTE: ${v("representante_vendedor", "[Nome do Representante dos Proprietários]")}
EMAIL: ${v("representante_vendedor_email", "[email do representante]")}

12.1.2. Para os fins deste item, a INC nomeia e constitui, como seu representante, a pessoa abaixo qualificada, de forma que qualquer aviso ou notificação entregue a ela ou por ela, será considerado regular e efetivamente cumprido para todos os efeitos legais.

REPRESENTANTE: RONALDO DA FONSECA E BARRETO
EMAIL: juridico@meuinc.com.br

12.3 As Partes poderão alterar seus respectivos endereços ou representantes, devendo comunicar imediatamente à outra Parte qualquer alteração. Enquanto tal comunicação não for efetuada, considerar-se-ão válidas as comunicações realizadas nos endereços constantes da Cláusula Primeira deste instrumento.`,
      historico: [],
      analise: null,
    },
    {
      key: "compliance",
      titulo: "13. Compliance",
      conteudo: `13.1 Código de Conduta. Cada uma das Partes declara, por si e por seus administradores, sócios, empregados, agentes, prepostos ou representantes, que:

a) conhece, cumpre e continuará a cumprir, integralmente, as disposições do Código de Conduta, que passa a ser parte deste Contrato, com versão disponível no endereço eletrônico www.meuinc.com.br;

b) concorda e está ciente de que é expressamente vedado receber ou entregar da ou para a outra Parte recurso financeiro, brindes, favores, presentes, refeições de negócios, convites para eventos comemorativos e similares, a qualquer pretexto, excetuando-se os brindes meramente institucionais e sem valor comercial; e

c) está ciente da existência de um canal exclusivo e confidencial da INC, para comunicação segura e anônima de condutas consideradas antiéticas ou que violem o Código de Conduta e/ou legislações vigentes, e que o relato pode ser realizado pelos canais de denúncia disponíveis.

13.1 Regras Anticorrupção. As Partes declaram que têm conhecimento das leis anticorrupção brasileiras, em especial a Lei nº 9.613/98 ("Lei sobre os crimes de Lavagem de Dinheiro") e a Lei nº 12.846/13 ("Lei Anticorrupção"), bem como a Lei dos Estados Unidos sobre Práticas de Corrupção no Exterior (Foreign Corrupt Practices Act – FCPA), obrigando-se a cumprir integralmente com seus dispositivos, mediante a abstenção de qualquer atividade que constitua ou possa constituir uma violação à tais leis ("Regras Anticorrupção").

13.1.1 Cada uma das Partes obriga-se a conduzir suas práticas comerciais, durante a consecução do presente Contrato, de forma ética e em conformidade com os preceitos legais aplicáveis, reconhecendo que não devem dar, oferecer, pagar, prometer pagar, ou autorizar, direta ou indiretamente, o pagamento de qualquer dinheiro ou qualquer coisa de valor a qualquer autoridade governamental, consultores, representantes, parceiros ou quaisquer terceiros, com a finalidade de influenciar qualquer ato ou decisão, assegurar qualquer vantagem indevida ou direcionar negócios a quaisquer pessoas que violem as Regras Anticorrupção.

13.1.2 Os PROPRIETÁRIOS concordam em indenizar e manter a INC isenta e a salvo de todos e quaisquer danos ou perdas, diretos ou indiretos, incluindo multas, custos, obrigações de reparação de danos, taxas, juros, honorários advocatícios ou outras responsabilidades, incluindo as criminais, que venham a ser incorridas pela INC a partir de investigação ou qualquer outro procedimento judicial ou administrativo em face dos PROPRIETÁRIOS, mas que tenha sido originado a partir de qualquer ação ou omissão dos PROPRIETÁRIOS que representem uma violação às Regras Anticorrupção.

13.2 Cada uma das Partes declara sua estrita observância à Convenção 138 da Organização Internacional do Trabalho (OIT), especificamente ao artigo 3º, parágrafo 1º, e à Constituição Federal de 1988, especificamente ao artigo 7º, inciso XXXIII, que proíbem o trabalho de menores de 18 (dezoito) anos em atividades noturnas, perigosas ou insalubres e de menores de 16 (dezesseis) anos em qualquer trabalho, exceto na condição de aprendizes, a partir de 14 (quatorze) anos de idade.

13.3 Adicionalmente, cada uma das Partes se compromete a não empregar/permitir a prática de trabalho análogo ao escravo ou qualquer outra forma de trabalho ilegal.

13.4 O descumprimento de qualquer das obrigações estabelecidas nesta cláusula ocasionará a rescisão imediata e de pleno direito do presente Contrato, com justa causa, independentemente de concessão de aviso prévio ou de interpelação judicial ou extrajudicial.`,
      historico: [],
      analise: null,
    },
    {
      key: "sigilo",
      titulo: "14. Do Sigilo",
      conteudo: `14.1 As partes, por seus dirigentes, prepostos ou empregados, comprometem-se, mesmo após o término do presente contrato, a manter completa confidencialidade e sigilo sobre quaisquer dados ou informações obtidas em razão do presente contrato, reconhecendo que não poderão ser divulgados ou fornecidos a terceiros, salvo com expressa autorização, por escrito, da outra parte.

14.2 As partes serão responsáveis, civil e criminalmente, por quaisquer danos causados uma à outra e/ou terceiros em virtude da quebra da confidencialidade e sigilo a que estão obrigadas.`,
      historico: [],
      analise: null,
    },
    {
      key: "disposicoes_gerais",
      titulo: "15. Disposições Gerais",
      conteudo: `15.1. Os PROPRIETÁRIOS comprometem-se a realizar esta negociação de forma firme, válida e eficaz, bem como a responder pela evicção de direito, nos termos da cláusula constituti, por si, seus herdeiros e sucessores.

15.2. Cessão do Contrato: O presente instrumento só poderá ser cedido com anuência expressa e por escrita das partes.

15.3. Totalidade das Avenças. O presente Instrumento Particular contém a totalidade das avenças e entendimentos havidos entre as Partes.

15.4. Renúncia. Nenhuma renúncia, rescisão ou quitação relativa ao presente Contrato ou de quaisquer de seus termos ou disposições vinculará quaisquer das Partes, salvo se confirmada por escrito pela própria Parte interessada.

15.5. Tolerância. A tolerância de qualquer das Partes em relação ao eventual ou continuado descumprimento de qualquer obrigação não poderá ser entendida, em circunstância alguma, como novação do ajustado.

15.6. Alteração. O presente Contrato somente poderá ser alterado por meio de instrumento escrito e assinado pelas Partes.

15.7. Consentimento. Salvo se expressamente previsto neste Contrato, sempre que o consentimento ou aprovação de qualquer Parte for necessário, tal consentimento ou aprovação não será negado, retardado ou condicionado, sem justificativa.

15.8. Autonomia. Caso qualquer disposição deste Contrato seja considerada nula, anulável, inválida ou ineficaz, as demais disposições deste Contrato permanecerão em pleno vigor, válidas e exequíveis, devendo as Partes negociar um ajuste equânime da disposição considerada nula, anulável, inválida ou ineficaz de modo a assegurar a respectiva validade e exequibilidade.

15.9. Efeito Vinculante. O presente Contrato é celebrado em caráter irrevogável e irretratável.

15.10. Execução Específica. As obrigações assumidas pelas Partes neste Contrato estão sujeitas a execução específica de acordo com as regras contidas nos artigos 497, 501 e seguintes do Código de Processo Civil Brasileiro, a qual poderá ser exigida por qualquer uma das Partes.

15.11. Melhores Esforços, Demais Garantias. Observados os termos e condições aqui contidos, cada uma das Partes compromete-se a praticar todos os atos, inclusive a emissão de quaisquer documentos, bem como a tomar todas as medidas necessárias ou convenientes, nos termos das leis aplicáveis, a fim de consumar e conferir eficácia às operações aqui previstas.

15.12. O presente Contrato é regido e interpretado de acordo com as leis brasileiras.

15.13. As partes, de comum acordo, aceitam utilizar o sistema de assinatura digital, haja vista que a utilização de meios virtuais para assinatura de documentos foi regulamentada pela Medida Provisória 2.200-2/2001, pelo qual declaram neste ato a autoria e integridade do contrato assinado de forma digital, como também declaram sua validade entre si e perante terceiros e/ou a quem for oposto.

15.14. Os PROPRIETÁRIOS declaram, para todos os fins de direito que tiveram prévio conhecimento das cláusulas contratuais, por período e modo suficientes para o pleno conhecimento das estipulações previstas, as quais reputam claras e desprovidas de ambiguidade, dubiedade ou contradição, estando cientes dos direitos e das obrigações previstas neste contrato.`,
      historico: [],
      analise: null,
    },
    {
      key: "intermediacao",
      titulo: "16. Da Intermediação Imobiliária",
      conteudo: `16.1 Os PROPRIETÁRIOS serão responsáveis pelo pagamento da comissão de intermediação imobiliária decorrente do presente contrato, correspondente a ${v("comissao_percentual", "5% (cinco por cento)")} sobre o valor indicado no item 3.5, ao(s) corretor(es) ${v("corretor.nome", "[nome do(s) corretor(es)]")}. As condições do referido pagamento serão formalizadas por instrumento particular próprio.

16.2 Os PROPRIETÁRIOS declaram, sob as penas da lei, que não existem outros corretores de imóveis com contrato de exclusividade e/ou que tenham participado, direta ou indiretamente, da intermediação do TERRENO, além daquele(s) expressamente indicado(s) no item 16.1. Na hipótese de eventual reclamação, cobrança ou reivindicação de comissão por parte de terceiro(s) que alegue(m) participação na intermediação do negócio, os PROPRIETÁRIOS assumem integral e exclusiva responsabilidade pelo pagamento de quaisquer valores, isentando a INC de toda e qualquer obrigação, inclusive quanto a perdas e danos, custas e honorários advocatícios.`,
      historico: [],
      analise: null,
    },
    {
      key: "foro",
      titulo: "17. Do Foro",
      conteudo: `17.1 O foro eleito para dirimir dúvidas e processar ações derivadas deste negócio jurídico é o da localização do TERRENO, com renúncia expressa das Partes contratantes a qualquer outro foro, por mais especial ou privilegiado que seja ou que venha a ser, independentemente do domicílio ou residência atuais ou futuros dos contratantes.

E, por estarem justas e contratadas, assinam o presente Contrato, de forma eletrônica na presença das duas testemunhas subscritas.

${v("terreno.cidade", "_______________")}, ${v("data_assinatura", "___/___/______")}.`,
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
  "imovel",
  "objeto_preco",
  "documentacao",
  "condicoes_suspensivas",
  "posse_escrituras",
  "empreendimento",
  "mandato",
  "despesas",
  "condicoes_resolutivas",
  "irrevogabilidade",
  "comunicacoes",
  "compliance",
  "sigilo",
  "disposicoes_gerais",
  "intermediacao",
  "foro",
];

// Cláusulas que merecem atenção jurídica especial
export const CLAUSULAS_IMPORTANTES = [
  "condicoes_suspensivas",
  "condicoes_resolutivas",
  "objeto_preco",
  "posse_escrituras",
  "intermediacao",
];
