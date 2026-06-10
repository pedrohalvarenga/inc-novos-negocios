# Setup — INC Novos Negócios

## 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → New Project
2. Anote as credenciais em **Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Em **Settings → Database**, copie as strings de conexão:
   - **Transaction Pooler** (porta 6543) → `DATABASE_URL`
   - **Session Mode** ou conexão direta (porta 5432) → `DIRECT_URL`

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com os valores reais do Supabase
```

## 3. Criar o schema no banco

```bash
npx prisma db push
```

## 4. Criar usuário admin no Supabase Auth

1. No painel Supabase → **Authentication → Users → Invite user**
2. Use o e-mail `admin@inc.com.br` (ou o que preferir)
3. Após criar, execute o seed para popular o banco:

```bash
npm run db:seed
```

> **Atenção:** O seed cria registros de `Usuario` com `supabaseId` placeholder.
> Para login funcionar, edite o seed com o UUID real do seu usuário Supabase Auth,
> ou crie o usuário normalmente pelo sistema após o primeiro login.

## 5. Rodando localmente

```bash
npm run dev
# Acesse http://localhost:3000
```

## 6. Substituir o logo

Coloque o arquivo do logo em alta resolução em:

```
public/brand/logo.svg   (ou logo.png)
```

Atualize o path em `src/components/layout/Sidebar.tsx` se necessário.

---

## Comandos úteis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run db:push` | Aplica o schema no banco |
| `npm run db:seed` | Popula com dados de exemplo |
| `npm run db:studio` | Abre o Prisma Studio (visual do banco) |
| `npm run db:generate` | Regenera o Prisma Client |
