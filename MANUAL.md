# Manual de Uso — Sistema INC Novos Negócios

## 1. Como iniciar o sistema

### Opção A — Duplo clique (recomendado)
1. Abra a pasta do projeto no Windows Explorer
2. Dê duplo clique em **`INICIAR SISTEMA.bat`**
3. Uma janela de terminal abre e o servidor sobe automaticamente
4. Após ~8 segundos, o navegador abre em **http://localhost:3000**
5. Na primeira execução (ou após atualização de pacotes), o bat executa `npm install` automaticamente — aguarde a conclusão

> Deixe a janela do terminal aberta enquanto usar o sistema. Fechar encerra o servidor.

### Opção B — Terminal
```bash
cd "C:\Users\lucas.costa\Documents\Sistema Novos Negócios\inc-novos-negocios"
npm install       # só na primeira vez ou após git pull
npm run dev
```
Acesse **http://localhost:3000**

---

## 2. Credenciais de acesso

| E-mail | Senha | Perfil |
|--------|-------|--------|
| admin@inc.com.br | Inc@2025! | ADMIN — acesso total |
| gestor@inc.com.br | Inc@2025! | GESTOR — aprova/assina |
| analista@inc.com.br | Inc@2025! | ANALISTA — somente leitura e preenchimento |

**Restrições do perfil ANALISTA:**
- Não pode aprovar nem assinar contratos
- Não pode confirmar pagamentos
- Não pode alterar status de proposta para ENVIADA

---

## 3. Como cadastrar um terreno

1. No menu lateral, clique em **Terrenos → + Novo terreno**
2. Preencha os campos obrigatórios: **Nome**, **Cidade**, **UF**, **Área do terreno**
3. Em **Proprietários**: clique em "+ Adicionar proprietário", busque pelo nome/CPF-CNPJ ou cadastre um novo
4. Para **Corretor**: marque "Tem corretor?" e vincule o contato
5. Preencha os dados financeiros: **VGV Estimado**, **Valor de Compra**, **Forma de Pagamento**, **Prazo**
6. Clique em **Salvar terreno**

### Score de negociação
Após preencher VGV + Valor de Compra + Forma de Pagamento, o score aparece automaticamente na aba **Viabilidade**.

---

## 4. Calculadora de viabilidade (aba Viabilidade)

A aba **Viabilidade** dentro de cada terreno oferece:

- **% Terreno/VGV** com faixas de cor: verde (≤10%), amarelo (≤15%), vermelho (>15%)
- **Custo por unidade** e **custo por m²** calculados automaticamente
- **Simulador de permuta**: informe o ticket médio das unidades para ver quantas unidades equivalem ao valor do terreno
- **Cenários lado a lado**: compara score para diferentes formas de pagamento (Permuta Física, Financeira, Misto, Dinheiro a Prazo, Dinheiro à Vista)
- **Score 0–100** calculado por: VGV (40%) + Pagamento (25%) + Prazo (20%) + Risco de Matrícula (15%)

---

## 5. Fluxo completo: Proposta → Contrato → Assinatura

### Passo 1 — Criar proposta
1. Abra o terreno → aba **Propostas** → **+ Nova proposta**
2. Preencha: valor proposto, forma de pagamento, prazo, validade
3. Salve como **Rascunho**

### Passo 2 — Avançar a proposta
- **Rascunho → Enviada**: gestor/admin clica "Marcar como Enviada"
- **Enviada → Aceita**: ao confirmar negociação concluída
- Status atualiza automaticamente o funil do terreno

### Passo 3 — Gerar contrato
1. Com a proposta ACEITA, clique em **Gerar Contrato**
2. O contrato é criado em status **Minuta**
3. Abra o contrato → edite as cláusulas conforme necessário

### Passo 4 — Análise jurídica
1. No contrato, clique em **Analisar Contrato**
2. Leia a seção abaixo sobre o fluxo híbrido de IA

### Passo 5 — Assinar
1. O contrato deve estar em **Aprovado**
2. Clique em **Assinar Contrato**
3. Se houver due diligence com item CRÍTICO pendente ou matrícula IMPEDITIVA, o sistema bloqueia — resolva as pendências primeiro
4. Admin pode usar override com justificativa se necessário
5. Ao assinar, lançamentos financeiros são gerados automaticamente

---

## 6. Fluxo híbrido de IA (contrato, matrícula e due diligence)

O sistema funciona **com ou sem** a chave de IA (`ANTHROPIC_API_KEY`). Quando a chave não está configurada, o modo híbrido manual é ativado:

### Análise de Contrato (modo manual)
1. Abra o contrato → clique em **Analisar Contrato**
2. Um modal abre com um **prompt pronto** — copie-o
3. Cole o prompt no [Claude](https://claude.ai) ou qualquer LLM
4. O modelo retorna um JSON de análise — copie a resposta
5. Cole o JSON no campo do modal e clique em **Aplicar análise**
6. Os alertas aparecem automaticamente no painel do contrato

**Formato do JSON esperado (exemplo válido):**
```json
{
  "alertas": [
    { "tipo": "CRITICO", "clausula": "Prazo", "descricao": "Prazo de 6 meses abaixo do mínimo recomendado" },
    { "tipo": "ATENCAO", "clausula": "Permuta", "descricao": "Percentual de permuta acima da média de mercado" }
  ],
  "recomendacoes": "Negociar prazo mínimo de 24 meses.",
  "aprovado": false
}
```

### Análise de Matrícula (modo manual)
1. Terreno → aba **Matrícula & DD** → **Analisar Matrícula**
2. Faça upload da imagem ou PDF da matrícula
3. Copie o prompt gerado e cole no Claude com a imagem anexada
4. Copie o JSON de resposta e cole na tela de conferência
5. Revise os dados extraídos (número, cartório, ônus)
6. Selecione o nível de risco: BAIXO / MÉDIO / ALTO / IMPEDITIVO
7. Clique em **Salvar matrícula**
8. O risco reflete automaticamente no score do terreno (peso 15%)

### Análise de Due Diligence (modo manual)
1. Terreno → aba **Matrícula & DD** → **Nova Due Diligence**
2. Selecione o proprietário e o tipo (CPF/CNPJ)
3. Copie o prompt gerado e consulte o Claude
4. Cole o JSON de resultado na tela
5. Itens com status `CRITICO` bloqueiam a assinatura do contrato

---

## 7. Financeiro

### Registrar pagamento
1. Menu **Financeiro** → localize o lançamento
2. Clique no ícone de pagamento ou em **Pagar**
3. Informe a data de pagamento e clique em **Confirmar**
4. O status muda para **PAGO** e o fluxo de caixa é atualizado

### Calendário de vencimentos
- Acesse **Financeiro → Calendário**
- Vencimentos são exibidos por data com código de cores (previsto / atrasado / pago)

### Cron de alertas
- O sistema verifica vencimentos automaticamente via `POST /api/cron/verificar-vencimentos`
- Alertas aparecem no sino (🔔) no canto superior direito
- Configure um cron externo para chamar esse endpoint diariamente

---

## 8. O que fazer se o banco estiver pausado

O Supabase pausa projetos do plano **Free** após **1 semana sem acesso**.

**Sintomas:** tela branca, "Banco de dados pausado" ou timeout ao abrir o sistema.

**Solução:**
1. Acesse **https://supabase.com/dashboard/project/canqyiuvxdhxlknopqqs**
2. Clique em **Restore project** (botão verde ou laranja)
3. Aguarde ~2 minutos
4. Recarregue o sistema em http://localhost:3000

**Prevenção:** acesse o sistema pelo menos uma vez por semana para evitar a pausa automática.

---

## 9. Exportações

- **Terrenos (Excel):** Menu Terrenos → botão **Exportar XLSX** — exporta todos os terrenos com score e dados financeiros
- **Contratos (PDF):** Abra o contrato → **Exportar PDF** — gera PDF com cláusulas e identidade visual INC
- **Matrícula (PDF):** Aba Matrícula → **Baixar PDF da matrícula**
- **Financeiro (Excel):** Menu Financeiro → **Exportar relatório**

---

## 10. Dúvidas frequentes

**Como mover um terreno no funil?**
Abra o terreno → aba Dados → botão **Mover para próxima etapa** ou use o seletor de status.

**Como ver o histórico de um terreno?**
Aba **Histórico** — mostra todas as mudanças de status com data e responsável.

**Como adicionar notificações?**
As notificações são automáticas via cron. Para ver notificações antigas: clique no sino no header.

**O sistema não abre no navegador?**
Verifique se o terminal ainda está aberto e mostrando "Ready". Se não, reinicie via `INICIAR SISTEMA.bat`.
