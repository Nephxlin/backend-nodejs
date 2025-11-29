# 🔄 Guia de Migração PostgreSQL → SQLite

## ❌ Problema Identificado

O backend estava configurado para PostgreSQL mas deveria usar SQLite, causando:
- `Error in PostgreSQL connection: Error { kind: Closed }`
- `timeout of 30000ms exceeded` ao carregar jogos PGSoft

## ✅ Correções Aplicadas

### 1. Schema Prisma
- ✅ Já estava configurado para SQLite: `provider = "sqlite"`
- ⚠️ Contém anotações `@db.Decimal()` do PostgreSQL (compatíveis, mas desnecessárias)

### 2. Arquivo .env
- ❌ **NÃO EXISTIA**
- ✅ **CRIADO scripts para gerar**

### 3. env.example
- ❌ Estava com DATABASE_URL do PostgreSQL
- ✅ **CORRIGIDO** para SQLite

### 4. Código database.ts
- ❌ Mensagem "Conectado ao PostgreSQL"
- ✅ **CORRIGIDO** para "Conectado ao banco SQLite"

---

## 🚀 Como Aplicar as Correções

### Passo 1: Criar arquivo .env

#### No Windows:
```bash
cd e:\Gambling\felp-cacto\backend-nodejs
create-env.bat
```

#### No Linux/Mac:
```bash
cd e:\Gambling\felp-cacto\backend-nodejs
chmod +x create-env.sh
./create-env.sh
```

#### Ou Manualmente:
Crie o arquivo `.env` na raiz do projeto com:
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
NODE_ENV="development"
JWT_SECRET="seu-secret-super-seguro-aqui"
# ... (copie do env.example)
```

### Passo 2: Gerar Prisma Client

```bash
yarn prisma generate
```

### Passo 3: Verificar/Criar o Banco de Dados

Se o arquivo `prisma/dev.db` NÃO existe:
```bash
yarn prisma db push
```

Se o arquivo `prisma/dev.db` JÁ existe com dados:
```bash
# Apenas gere o client, não precisa fazer push
yarn prisma generate
```

### Passo 4: (Opcional) Popular o Banco

Se quiser popular com dados de exemplo:
```bash
yarn seed
```

### Passo 5: Testar a Aplicação

```bash
# Desenvolvimento
yarn dev

# Produção
yarn build
yarn start
```

---

## 📊 Verificação Pós-Migração

### Logs Esperados:

**Antes (Errado):**
```
❌ Erro ao conectar ao banco: Error in PostgreSQL connection
prisma:error Error { kind: Closed }
```

**Depois (Correto):**
```
✅ Conectado ao banco SQLite
📁 Banco: file:./prisma/dev.db
```

### Teste de Conexão:

```bash
yarn prisma studio
```

Isso deve abrir o Prisma Studio conectado ao SQLite.

---

## ⚠️ Notas Importantes

### Diferenças SQLite vs PostgreSQL:

| Aspecto | PostgreSQL | SQLite |
|---------|------------|--------|
| Tipo Decimal | `NUMERIC` | `REAL` |
| Sintaxe @db | `@db.Decimal(20,2)` | Opcional |
| Concorrência | Alta | Baixa |
| Transações | Avançadas | Básicas |

### O schema funciona, mas:

O schema.prisma contém 45 ocorrências de `@db.Decimal(20, 2)` que são específicas do PostgreSQL. Elas **funcionam no SQLite** (Prisma converte), mas são redundantes.

**NÃO é necessário removê-las**, a menos que queira um schema mais limpo.

---

## 🔧 Comandos Úteis

```bash
# Ver o schema aplicado
yarn prisma db pull

# Abrir interface visual do banco
yarn prisma studio

# Criar migration
yarn prisma migrate dev --name nome_da_migration

# Aplicar schema sem criar migration
yarn prisma db push

# Resetar banco (CUIDADO: apaga tudo!)
yarn prisma migrate reset

# Verificar status das migrations
yarn prisma migrate status

# Popular banco com seed
yarn seed
```

---

## 🐳 Deploy com Docker

Se usar Docker, o DATABASE_URL deve apontar para um volume persistente:

```dockerfile
ENV DATABASE_URL="file:/app/data/database.sqlite"

VOLUME ["/app/data"]
```

No Coolify:
```
Host Path: /var/lib/coolify/volumes/backend-db
Container Path: /app/data
```

---

## 📝 Checklist Final

- [ ] Arquivo `.env` criado na raiz
- [ ] `DATABASE_URL="file:./prisma/dev.db"` configurado
- [ ] `yarn prisma generate` executado com sucesso
- [ ] Banco `prisma/dev.db` existe
- [ ] `yarn dev` inicia sem erros de conexão
- [ ] Prisma Studio abre corretamente
- [ ] Logs mostram "Conectado ao banco SQLite"

---

## 🆘 Troubleshooting

### Erro: "Environment variable not found: DATABASE_URL"

**Causa**: Arquivo .env não existe ou está no lugar errado

**Solução**:
```bash
# Verifique se está na raiz do projeto
cd e:\Gambling\felp-cacto\backend-nodejs
# Execute o script
create-env.bat
```

### Erro: "Can't reach database server"

**Causa**: Caminho do DATABASE_URL incorreto

**Solução**: Verifique se é `file:./prisma/dev.db` (caminho relativo)

### Erro: "no such table"

**Causa**: Banco existe mas está vazio

**Solução**:
```bash
yarn prisma db push
yarn seed
```

### Timeout ao carregar jogos PGSoft

**Causa**: PGSoft API não está rodando ou configurada

**Solução**:
1. Verifique se a API PGSoft está rodando
2. Configure no `.env`:
```env
PGSOFT_API_URL="http://localhost:4000"
PGSOFT_AGENT_ID="seu-id"
PGSOFT_SECRET_KEY="sua-chave"
```

---

## ✅ Status da Migração

- [x] Schema configurado para SQLite
- [x] Scripts de criação do .env
- [x] env.example corrigido
- [x] database.ts corrigido
- [x] Documentação criada
- [ ] **PENDENTE: Executar create-env.bat**
- [ ] **PENDENTE: Executar yarn prisma generate**

---

**Após executar os passos acima, o backend estará 100% configurado para SQLite!** 🎉

