# Sistema INC — Novos Negócios

Sistema interno de gestão de prospecção e aquisição de terrenos da INC Empreendimentos.

## Acesso

| Usuário | E-mail | Perfil |
|---------|--------|--------|
| Administrador | admin@inc.com.br | ADMIN |
| Gestor | gestor@inc.com.br | GESTOR |
| Analista | analista@inc.com.br | ANALISTA |

> Senha definida via Supabase Auth (Settings → Authentication → Users → Reset password).

## Iniciar o sistema

```
INICIAR SISTEMA.bat   ← duplo clique
```

Ou manualmente:

```bash
npm install
npm run dev
# Acesse http://localhost:3000
```

## Stack

- **Next.js** (App Router, TypeScript, Tailwind CSS)
- **Supabase** — Auth (SSR cookie-based) + PostgreSQL
- **Prisma 7** com adapter `@prisma/adapter-pg` (pgbouncer)

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=          # pooler porta 6543 com ?pgbouncer=true
DIRECT_URL=            # conexão direta porta 5432 para migrations

# Opcionais — sistema funciona sem elas:
ANTHROPIC_API_KEY=     # IA para análise jurídica e matrícula (modo manual sem ela)
SMTP_HOST=             # E-mail de notificações via Nodemailer
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

## Módulos

| Módulo | Rota | Descrição |
|--------|------|-----------|
| Dashboard | `/dashboard` | KPIs, funil, score médio, tabela de terrenos |
| Terrenos | `/terrenos` | CRUD completo com proprietários, filtros e histórico |
| Propostas | `/propostas` | Gestão de propostas com workflow de status |
| Contratos | `/contratos` | Contratos com due diligence e assinatura |
| Matrículas | `/matriculas` | Análise de risco de matrícula (IA ou modo manual) |
| Due Diligence | `/due-diligence` | Checklist jurídico com parecer de IA |
| Financeiro | `/financeiro` | Lançamentos, recorrências e alertas de vencimento |
| Notificações | sino no header | Alertas in-app em tempo real |
| Configurações | `/configuracoes` | Usuários, Zenkit, integrações |

## Score de negociação (0–100)

Calculado por `src/lib/score.ts` com 4 componentes:

| Componente | Peso | Fonte |
|------------|------|-------|
| % Terreno/VGV | 40% | `valorCompra / vgvEstimado` |
| Forma de pagamento | 25% | `formaPagamento` |
| Prazo | 20% | `prazoPagamento` |
| Risco de matrícula | 15% | `getRiscoMatricula()` (BAIXO=100, MEDIO=50, ALTO=25, IMPEDITIVO=0) |

## Cron job

`POST /api/cron/verificar-vencimentos` — executar diariamente:
- Marca lançamentos vencidos como `ATRASADO`
- Notifica gestores sobre lançamentos vencendo em 7 dias / hoje / atrasados
- Alerta sobre propostas com `validade` expirando em 7 dias
- Alerta sobre contratos com `dataVencimento` crítica em 7 dias

## Identidade visual

Laranja `#FF7924` · Logo em `/public/brand/`

---

> Decisões técnicas e registro de consolidação: [DECISOES.md](DECISOES.md)
