# 🚀 Guia de Deploy - Backend Node.js

## 📋 Deploy no Coolify

### 1️⃣ Configurar Variáveis de Ambiente

No Coolify, adicione todas as variáveis do arquivo `env.example`:

```bash
# Database (OBRIGATÓRIO)
DATABASE_URL=postgresql://usuario:senha@host:5432/database?schema=public

# JWT (OBRIGATÓRIO)
JWT_SECRET=seu-secret-super-seguro-aqui-gere-um-novo
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=production

# App URLs (OBRIGATÓRIO para CORS e upload de imagens)
APP_URL=https://seu-backend.coolify.app
FRONTEND_URL=https://seu-frontend.coolify.app
ADMIN_PANEL_URL=https://seu-admin.coolify.app

# Currency
CURRENCY_CODE=BRL
CURRENCY_SYMBOL=R$

# Asaas Gateway (se usar pagamentos)
ASAAS_API_KEY=sua-api-key-asaas
ASAAS_API_URL=https://www.asaas.com/api/v3
ASAAS_WALLET_ID=

# PGSoft Integration
PGSOFT_API_URL=https://seu-pgsoft-api.coolify.app
PGSOFT_AGENT_ID=seu-agent-id
PGSOFT_SECRET_KEY=sua-secret-key
```

### 2️⃣ Configurar Build Commands

No Coolify, configure os comandos:

**Build Command:**
```bash
yarn install && yarn build
```

**Start Command:**
```bash
yarn start:prod
```

⚠️ **IMPORTANTE:** Use `yarn start:prod` ao invés de `yarn start` para aplicar as migrações automaticamente!

### 3️⃣ Primeira Deploy

Após configurar tudo:

1. Clique em **Deploy**
2. Aguarde o build completar
3. Verifique os logs para garantir que as migrações foram aplicadas:
   ```
   ✅ Migrations applied successfully
   ✅ Prisma Client generated
   🚀 Servidor rodando na porta 3000
   ```

### 4️⃣ Verificar Funcionalidade

Teste os endpoints principais:

```bash
# Health check
curl https://seu-backend.coolify.app/

# Login (após criar usuário)
curl -X POST https://seu-backend.coolify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"senha123"}'
```

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `yarn dev` | Desenvolvimento com hot reload |
| `yarn build` | Build de produção (inclui `prisma generate`) |
| `yarn start` | Inicia servidor (apenas) |
| `yarn start:prod` | **Deploy em produção** (aplica migrações + inicia) |
| `yarn prisma:deploy` | Aplica migrações manualmente |
| `yarn prisma:generate` | Gera Prisma Client |
| `yarn prisma:studio` | Abre interface visual do banco |
| `yarn seed` | Roda seed do banco |

## 🗃️ Migrações do Prisma

### Automático (Recomendado)

Ao usar `yarn start:prod`, as migrações são aplicadas automaticamente:

```bash
prisma db push --accept-data-loss  # Aplica mudanças do schema
prisma generate                     # Gera Prisma Client
node dist/app.js                    # Inicia servidor
```

### Manual (Se necessário)

Se precisar aplicar migrações manualmente:

```bash
# No seu terminal local
yarn prisma:deploy

# Ou via SSH no Coolify
cd /seu-projeto
yarn prisma:deploy
```

## ⚠️ Problemas Comuns

### Erro: "Column transactions.userId does not exist"

**Causa:** Migrações não foram aplicadas no banco de dados.

**Solução:**
1. Verifique se está usando `yarn start:prod` no Coolify
2. Se não, mude o **Start Command** para `yarn start:prod`
3. Faça **Redeploy**

### Erro: "Prisma Client is not generated"

**Causa:** `prisma generate` não foi executado.

**Solução:**
- O script `postinstall` roda automaticamente após `yarn install`
- Se persistir, rode manualmente: `yarn prisma:generate`

### Erro: "Cannot connect to database"

**Causa:** `DATABASE_URL` incorreta ou banco inacessível.

**Solução:**
1. Verifique a `DATABASE_URL` no Coolify
2. Teste conexão com o banco
3. Verifique se o banco PostgreSQL está rodando

### Erro: "CORS blocked"

**Causa:** `FRONTEND_URL` ou `ADMIN_PANEL_URL` não configuradas.

**Solução:**
1. Adicione as URLs no Coolify
2. Faça **Redeploy**

## 📊 Estrutura de Deploy

```
Deploy Flow:
├── 1. yarn install          # Instala dependências
│   └── postinstall          # Gera Prisma Client automaticamente
├── 2. yarn build            # Compila TypeScript + gera Prisma Client
├── 3. yarn start:prod       # Aplica migrações + inicia servidor
│   ├── prisma db push       # Aplica schema ao banco
│   ├── prisma generate      # Gera Prisma Client
│   └── node dist/app.js     # Inicia servidor
```

## 🔒 Segurança

### Variáveis Sensíveis

**NUNCA** commite estas variáveis:
- ❌ `JWT_SECRET`
- ❌ `DATABASE_URL`
- ❌ `ASAAS_API_KEY`
- ❌ `PGSOFT_SECRET_KEY`

**SEMPRE** configure no Coolify como variáveis de ambiente.

### Gerar JWT_SECRET Seguro

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

## 📝 Checklist de Deploy

Antes de fazer deploy:

- [ ] Todas as variáveis de ambiente configuradas no Coolify
- [ ] `DATABASE_URL` testada e funcionando
- [ ] `JWT_SECRET` gerado (não use o do exemplo!)
- [ ] `APP_URL`, `FRONTEND_URL`, `ADMIN_PANEL_URL` corretas
- [ ] Start Command é `yarn start:prod`
- [ ] Build Command é `yarn install && yarn build`
- [ ] Banco de dados PostgreSQL está rodando
- [ ] Testar endpoints após deploy

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os **logs do Coolify**
2. Procure por erros de:
   - Conexão com banco
   - Migrações do Prisma
   - Variáveis de ambiente faltando
3. Consulte os arquivos de documentação:
   - `README.md` - Visão geral
   - `env.example` - Variáveis disponíveis
   - Este arquivo - Guia de deploy

