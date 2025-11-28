# ⚙️ Configuração do Coolify - Backend Node.js

## 🚨 PROBLEMA IDENTIFICADO

Nos logs, vejo que:
- ✅ Prisma Client foi gerado
- ❌ **Migrações NÃO foram aplicadas** (`prisma db push` não executou)

Isso significa que o **Start Command ainda está incorreto** no Coolify.

---

## 📋 PASSO A PASSO PARA CORRIGIR

### 1️⃣ Verificar Start Command no Coolify

1. Acesse seu projeto `backend-nodejs` no Coolify
2. Vá em **Settings** (ícone de engrenagem)
3. Role até encontrar **Start Command**

**Verifique se está assim:**
```bash
yarn start
```

**Se estiver, ESTÁ ERRADO!** ❌

---

### 2️⃣ Corrigir Start Command

**Mude para:**
```bash
yarn start:prod
```

**Captura de tela do que procurar:**
```
┌─────────────────────────────────────────┐
│ Start Command                           │
├─────────────────────────────────────────┤
│ [yarn start:prod                     ]  │ ← Deve estar assim
└─────────────────────────────────────────┘
```

Clique em **Save** (Salvar).

---

### 3️⃣ Verificar Build Command (Opcional)

Enquanto estiver lá, verifique também o **Build Command**:

**Deve estar:**
```bash
yarn install && yarn build
```

Se estiver apenas `yarn build`, adicione o `yarn install &&` antes.

---

### 4️⃣ Fazer Redeploy

⚠️ **IMPORTANTE:** Apenas salvar não é suficiente. Você DEVE fazer **Redeploy**.

1. Volte para a página principal do projeto
2. Clique no botão **Redeploy** (ou **Deploy**)
3. Aguarde o build completar

---

### 5️⃣ Verificar Logs

Após o deploy, abra os **Logs** em tempo real e procure por:

**✅ O que DEVE aparecer agora:**
```
Datasource "db": PostgreSQL database...

✔ Generated Prisma Client (v5.22.0)...

Applying migration...
✅ Migrations applied successfully

✅ Conectado ao PostgreSQL
🚀 Servidor rodando na porta 3005
```

**❌ O que você estava vendo antes (ERRADO):**
```
✔ Generated Prisma Client (v5.22.0)...

✅ Conectado ao PostgreSQL   ← Pula direto para cá
🚀 Servidor rodando na porta 3005
```

---

## 🔍 Diferença Entre os Comandos

### `yarn start` (ERRADO para produção)
```bash
node dist/app.js
```
- ❌ Não aplica migrações
- ❌ Banco fica desatualizado
- ❌ Erro: "Column transactions.userId does not exist"

### `yarn start:prod` (CORRETO para produção)
```bash
prisma db push --accept-data-loss && prisma generate && node dist/app.js
```
- ✅ Aplica migrações do schema
- ✅ Gera Prisma Client
- ✅ Inicia servidor
- ✅ Banco atualizado automaticamente

---

## 🧪 Testar Após Redeploy

Depois que ver nos logs que as migrações foram aplicadas, teste o depósito:

```bash
curl 'http://seu-backend.coolify.app/api/wallet/deposit' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer SEU_TOKEN' \
  --data-raw '{"amount":50,"cpf":"16357773050","accept_bonus":true}'
```

**Deve funcionar agora!** 🎉

---

## 🐛 Se AINDA Der Erro

Se mesmo após mudar para `yarn start:prod` e fazer redeploy o erro persistir:

### Opção 1: Aplicar Migrações Manualmente (SSH)

1. Acesse o container via SSH no Coolify
2. Execute:
   ```bash
   cd /app
   yarn prisma:deploy
   ```

### Opção 2: Verificar DATABASE_URL

1. Vá em **Environment Variables**
2. Verifique se `DATABASE_URL` está correta
3. Formato: `postgresql://user:password@host:port/database?schema=public`

### Opção 3: Rebuild Completo

1. No Coolify, clique em **Force Rebuild**
2. Aguarde o build completar
3. Verifique os logs novamente

---

## ✅ Checklist de Verificação

Antes de considerar que está tudo certo:

- [ ] Start Command é `yarn start:prod`
- [ ] Build Command inclui `yarn install`
- [ ] Fiz **Redeploy** (não apenas restart)
- [ ] Nos logs aparece "Migrations applied" ou "prisma db push"
- [ ] Não há erro de "Column does not exist"
- [ ] Trust proxy configurado (sem erro de X-Forwarded-For)
- [ ] Endpoint de depósito funciona

---

## 📊 Estrutura de Comandos no Coolify

```
┌─────────────────────────────────────────────────────────┐
│ Coolify Configuration                                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Build Command:                                           │
│ ┌─────────────────────────────────────────────────┐    │
│ │ yarn install && yarn build                      │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ Start Command:                                           │
│ ┌─────────────────────────────────────────────────┐    │
│ │ yarn start:prod                                 │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [Save]                                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🆘 Ainda com Problemas?

Se após seguir todos os passos ainda houver problemas:

1. **Copie os logs completos** do Coolify
2. **Tire um print** da configuração (Settings → Start Command)
3. **Verifique** se há outros erros nos logs além do Prisma

---

## 📝 Resumo Rápido

**O que fazer AGORA:**
1. ✅ Mudar Start Command para `yarn start:prod`
2. ✅ Salvar configuração
3. ✅ Fazer **Redeploy** (não restart)
4. ✅ Verificar logs (deve aparecer "Migrations applied")
5. ✅ Testar endpoint de depósito

**Se fizer isso, o erro vai sumir!** 🚀

