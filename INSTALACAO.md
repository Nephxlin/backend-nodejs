# 📦 Instruções de Instalação e Configuração

## 🔧 Pré-requisitos

- **Node.js** 18+ instalado
- **PostgreSQL** 14+ instalado e rodando
- **npm** ou **yarn**

## 📥 Passo 1: Instalar Dependências

```bash
cd backend-nodejs
npm install
```

## ⚙️ Passo 2: Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database - Configure com suas credenciais PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/cassino_db?schema=public"

# JWT - Gere uma chave secreta segura
JWT_SECRET="sua-chave-secreta-super-segura-aqui"
JWT_EXPIRES_IN="24h"

# Server
PORT=3000
NODE_ENV="development"

# Currency
CURRENCY_CODE="BRL"
CURRENCY_SYMBOL="R$"

# Asaas Gateway - Configure com suas credenciais
ASAAS_API_KEY="sua-api-key-asaas"
ASAAS_API_URL="https://www.asaas.com/api/v3"
ASAAS_WALLET_ID=""

# PGSoft Integration
PGSOFT_API_URL="http://localhost:4000"
PGSOFT_AGENT_ID="seu-agent-id"
PGSOFT_SECRET_KEY="sua-secret-key"

# App
APP_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"
```

## 🗄️ Passo 3: Criar Banco de Dados

Crie um banco de dados PostgreSQL:

```sql
CREATE DATABASE cassino_db;
```

## 🔄 Passo 4: Executar Migrations do Prisma

Gere o cliente Prisma e execute as migrations:

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrations (criar tabelas)
npx prisma migrate dev --name init

# Ou apenas fazer push do schema (para desenvolvimento)
npx prisma db push
```

## 🌱 Passo 5: Popular Banco com Dados Iniciais

**IMPORTANTE:** Execute o seed para criar o usuário admin e configurações iniciais:

```bash
npm run seed
```

O seed criará:
- ✅ Configurações do sistema
- ✅ Moeda BRL
- ✅ Gateway Asaas
- ✅ 5 Níveis VIP (Bronze, Prata, Ouro, Platina, Diamante)
- ✅ 5 Categorias de jogos
- ✅ Configuração da roleta
- ✅ **Usuário Admin** (admin@cassino.com / admin123)
- ✅ Carteira do admin com R$ 10.000
- ✅ Banner de exemplo

**Credenciais do Admin:**
- Email: `admin@cassino.com`
- Senha: `admin123`
- Código de Convite: `ADMIN001`

⚠️ **IMPORTANTE:** Altere a senha do admin em produção!

## 🚀 Passo 6: Iniciar o Servidor

### Modo Desenvolvimento (com hot reload)

```bash
npm run dev
```

### Modo Produção

```bash
# Build
npm run build

# Start
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 🧪 Testando a API

### Health Check

```bash
curl http://localhost:3000/health
```

### Registrar Usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@example.com",
    "cpf": "12345678900",
    "phone": "11999999999",
    "password": "senha123",
    "term_a": true
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

## 📊 Prisma Studio (Visualizar Banco de Dados)

Para visualizar e editar dados do banco de forma visual:

```bash
npm run prisma:studio
```

Acesse: `http://localhost:5555`

## 🔍 Estrutura de Endpoints

### Autenticação (`/api/auth`)
- `POST /register` - Registrar usuário
- `POST /login` - Login
- `POST /logout` - Logout
- `GET /me` - Dados do usuário
- `GET /verify` - Verificar autenticação
- `POST /refresh` - Refresh token
- `POST /forget-password` - Solicitar reset de senha
- `POST /reset-password` - Resetar senha

### Carteira (`/api/wallet`)
- `GET /` - Obter carteira
- `GET /transactions` - Histórico de transações
- `GET /changes` - Histórico de mudanças
- `POST /toggle-hide-balance` - Ocultar/mostrar saldo

### Depósitos (`/api/wallet/deposit`)
- `POST /` - Criar depósito PIX
- `POST /verify` - Verificar status
- `GET /` - Listar depósitos

### Saques (`/api/wallet/withdraw`)
- `POST /` - Solicitar saque
- `GET /` - Listar saques

### Jogos (`/api/games`)
- `GET /` - Listar jogos
- `GET /featured` - Jogos em destaque
- `GET /:id` - Lançar jogo

### Perfil (`/api/profile`)
- `GET /` - Ver perfil
- `PUT /` - Atualizar perfil
- `GET /favorites` - Jogos favoritos

### Configurações (`/api/settings`)
- `GET /` - Configurações públicas
- `GET /banners` - Banners

## 🐛 Troubleshooting

### Erro de conexão com o banco

Verifique se:
1. PostgreSQL está rodando
2. Credenciais no `.env` estão corretas
3. Banco de dados existe

### Erro ao executar migrations

```bash
# Resetar banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset

# Ou apenas fazer push novamente
npx prisma db push --force-reset
```

### Erro de permissões

Certifique-se de que o usuário do PostgreSQL tem permissões:

```sql
GRANT ALL PRIVILEGES ON DATABASE cassino_db TO seu_usuario;
```

## 📝 Logs

Os logs são salvos em:
- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros

## 🔒 Segurança

⚠️ **IMPORTANTE PARA PRODUÇÃO:**

1. Altere o `JWT_SECRET` para uma chave forte e única
2. Configure HTTPS/SSL
3. Use variáveis de ambiente seguras (não commite o `.env`)
4. Configure CORS adequadamente
5. Ative rate limiting em produção
6. Use senhas fortes no banco de dados

## 📚 Documentação Adicional

- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 💡 Dicas

- Use `npm run dev` durante desenvolvimento (hot reload automático)
- Use Prisma Studio para visualizar/editar dados facilmente
- Consulte os logs em `logs/` para debug
- Teste os endpoints com Postman ou Insomnia

## 🆘 Suporte

Se encontrar problemas, verifique:
1. Versão do Node.js (deve ser 18+)
2. PostgreSQL está rodando
3. Todas as variáveis de ambiente estão configuradas
4. Migrations foram executadas com sucesso

