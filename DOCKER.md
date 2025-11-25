# 🐳 Guia Docker - PostgreSQL

Este guia mostra como usar Docker para rodar o PostgreSQL do projeto.

## 📦 Opções Disponíveis

### Opção 1: Apenas PostgreSQL (Recomendado para Desenvolvimento)

Use `docker-compose.yml` - Roda apenas o banco de dados PostgreSQL e PGAdmin.

### Opção 2: PostgreSQL + API Node.js

Use `docker-compose.full.yml` - Roda o banco de dados, API e PGAdmin.

---

## 🚀 Opção 1: Apenas PostgreSQL (Mais Comum)

### Iniciar PostgreSQL

```bash
# Iniciar o PostgreSQL
docker-compose up -d

# Ver logs
docker-compose logs -f postgres

# Parar
docker-compose down

# Parar e remover volumes (CUIDADO: apaga os dados)
docker-compose down -v
```

### Configuração

O PostgreSQL estará disponível em:
- **Host:** `localhost`
- **Porta:** `5433`
- **Usuário:** `cassino_user`
- **Senha:** `cassino_password`
- **Database:** `cassino_db`

### String de Conexão

```
DATABASE_URL="postgresql://cassino_user:cassino_password@localhost:5433/cassino_db?schema=public"
```

### PGAdmin (Interface Gráfica)

Acesse: `http://localhost:5050`

- **Email:** `admin@cassino.com`
- **Senha:** `admin123`

**Conectar ao PostgreSQL no PGAdmin:**
1. Abra `http://localhost:5050`
2. Login com as credenciais acima
3. Add New Server:
   - **Name:** Cassino DB
   - **Host:** `postgres` (dentro do Docker) ou `host.docker.internal` (do host)
   - **Port:** `5432` (porta interna do container)
   - **Username:** `cassino_user`
   - **Password:** `cassino_password`

### Rodar a API Localmente

Com o PostgreSQL rodando no Docker, rode a API localmente:

```bash
# Configurar .env
DATABASE_URL="postgresql://cassino_user:cassino_password@localhost:5433/cassino_db?schema=public"

# Gerar Prisma Client
npm run prisma:generate

# Rodar migrations
npx prisma db push

# Iniciar API
npm run dev
```

---

## 🚀 Opção 2: PostgreSQL + API (Tudo em Docker)

### Iniciar Tudo

```bash
# Build e start
docker-compose -f docker-compose.full.yml up -d --build

# Ver logs
docker-compose -f docker-compose.full.yml logs -f

# Parar
docker-compose -f docker-compose.full.yml down
```

### Acessar

- **API:** `http://localhost:3000`
- **Health Check:** `http://localhost:3000/health`
- **PGAdmin:** `http://localhost:5050`

### Configuração (.env para a opção full)

Crie um arquivo `.env` na raiz com:

```env
JWT_SECRET=sua-chave-secreta
ASAAS_API_KEY=sua-key
ASAAS_API_URL=https://www.asaas.com/api/v3
PGSOFT_API_URL=http://localhost:4000
PGSOFT_AGENT_ID=seu-agent-id
PGSOFT_SECRET_KEY=sua-secret-key
FRONTEND_URL=http://localhost:5173
```

---

## 🔧 Comandos Úteis

### Ver containers rodando

```bash
docker ps
```

### Logs do PostgreSQL

```bash
docker-compose logs -f postgres
```

### Entrar no container do PostgreSQL

```bash
docker exec -it cassino-postgres psql -U cassino_user -d cassino_db
```

### Executar comandos SQL

```bash
docker exec -it cassino-postgres psql -U cassino_user -d cassino_db -c "SELECT * FROM users LIMIT 5;"
```

### Backup do banco

```bash
# Criar backup
docker exec cassino-postgres pg_dump -U cassino_user cassino_db > backup.sql

# Restaurar backup
docker exec -i cassino-postgres psql -U cassino_user cassino_db < backup.sql
```

### Resetar banco (CUIDADO)

```bash
docker-compose down -v
docker-compose up -d
```

### Ver uso de espaço

```bash
docker system df
```

### Limpar volumes não utilizados

```bash
docker volume prune
```

---

## 🎯 Fluxo de Desenvolvimento Recomendado

### 1. Primeira vez

```bash
# 1. Iniciar PostgreSQL
docker-compose up -d

# 2. Aguardar PostgreSQL estar pronto
docker-compose logs -f postgres
# Aguarde ver: "database system is ready to accept connections"

# 3. Configurar .env
echo 'DATABASE_URL="postgresql://cassino_user:cassino_password@localhost:5433/cassino_db?schema=public"' > .env

# 4. Gerar Prisma e criar tabelas
npm run prisma:generate
npx prisma db push

# 5. Iniciar API em desenvolvimento
npm run dev
```

### 2. Dia a dia

```bash
# Iniciar PostgreSQL (se não estiver rodando)
docker-compose up -d

# Rodar API
npm run dev

# Quando terminar, pode deixar o PostgreSQL rodando ou parar:
docker-compose down
```

---

## 🐛 Troubleshooting

### Erro: porta 5433 já está em uso

```bash
# Ver o que está usando a porta
# Windows
netstat -ano | findstr :5433

# Linux/Mac
lsof -i :5433

# Parar outros containers
docker-compose down

# Ou mudar a porta no docker-compose.yml
ports:
  - '5434:5432'  # Usar porta 5434 ao invés de 5433
```

### PostgreSQL não conecta

```bash
# Verificar se está rodando
docker ps

# Ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres
```

### Erro de permissão de volume

```bash
# Linux/Mac: dar permissão
sudo chown -R $USER:$USER .

# Ou recriar volumes
docker-compose down -v
docker-compose up -d
```

### Container sempre reiniciando

```bash
# Ver logs detalhados
docker logs cassino-postgres

# Remover e recriar
docker-compose down -v
docker-compose up -d
```

---

## 📊 Monitoramento

### Ver recursos usados

```bash
docker stats cassino-postgres
```

### Ver conexões ativas

```bash
docker exec cassino-postgres psql -U cassino_user -d cassino_db -c "SELECT count(*) FROM pg_stat_activity;"
```

### Ver tamanho do banco

```bash
docker exec cassino-postgres psql -U cassino_user -d cassino_db -c "SELECT pg_size_pretty(pg_database_size('cassino_db'));"
```

---

## 🔒 Segurança em Produção

⚠️ **Para produção, altere:**

1. **Senhas fortes:**
```yaml
POSTGRES_PASSWORD: senha_super_forte_aleatoria
```

2. **Não exponha portas desnecessárias:**
```yaml
# Remova a exposição de porta se a API estiver no mesmo Docker network
# ports:
#   - '5433:5432'
```

3. **Use secrets do Docker:**
```yaml
secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt
```

4. **Backup automático:**
Configure backups regulares do volume `postgres_data`

---

## 📝 Resumo dos Arquivos

- **`docker-compose.yml`** - PostgreSQL + PGAdmin (desenvolvimento)
- **`docker-compose.full.yml`** - PostgreSQL + API + PGAdmin (completo)
- **`Dockerfile`** - Build da API Node.js
- **`.dockerignore`** - Arquivos ignorados no build

---

## 🎉 Pronto!

Agora você tem um PostgreSQL rodando no Docker na porta **5433**!

**Próximos passos:**
1. `docker-compose up -d` - Iniciar PostgreSQL
2. Configure o `.env` com a DATABASE_URL
3. `npm run prisma:generate && npx prisma db push` - Criar tabelas
4. `npm run dev` - Rodar API

**URLs úteis:**
- PostgreSQL: `localhost:5433`
- PGAdmin: `http://localhost:5050`
- API (se usar full): `http://localhost:3000`

