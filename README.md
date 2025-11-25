# 🎰 Cassino Backend - Node.js API

API Backend do sistema de cassino desenvolvida em Node.js com TypeScript, Express e Prisma.

## 🚀 Tecnologias

- **Node.js** 18+
- **TypeScript** 5.x
- **Express.js** 4.x
- **Prisma ORM** 5.x
- **PostgreSQL**
- **JWT** para autenticação
- **Bcrypt** para hash de senhas
- **Zod** para validação

## 📦 Instalação

### Opção 1: Com Docker (Recomendado)

```bash
# 1. Iniciar PostgreSQL no Docker
docker-compose up -d

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp env.example .env
# A DATABASE_URL já está configurada para o Docker (porta 5433)

# 4. Gerar cliente Prisma
npm run prisma:generate

# 5. Criar tabelas no banco
npx prisma db push

# 6. Seed (opcional)
npm run prisma:seed
```

📖 **Ver guia completo:** [DOCKER.md](DOCKER.md)

### Opção 2: PostgreSQL Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações de PostgreSQL local

# Gerar cliente Prisma
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Seed (opcional)
npm run prisma:seed
```

## 🏃 Executar

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build
npm run build

# Produção
npm start
```

## 📁 Estrutura do Projeto

```
backend-nodejs/
├── src/
│   ├── config/         # Configurações (database, jwt, etc)
│   ├── controllers/    # Controllers por módulo
│   ├── middlewares/    # Auth, validação, error handling
│   ├── services/       # Lógica de negócio
│   ├── routes/         # Rotas da API
│   ├── models/         # Tipos TypeScript
│   ├── utils/          # Helpers e utilities
│   ├── integrations/   # PGSoft, Asaas
│   └── app.ts          # Entry point
├── prisma/
│   └── schema.prisma   # Schema do banco
└── package.json
```

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer {seu-token}
```

## 📡 Principais Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário autenticado
- `POST /api/auth/refresh` - Refresh token

### Jogos
- `GET /api/games` - Listar jogos
- `GET /api/games/:id` - Detalhes do jogo
- `POST /api/games/:id/favorite` - Favoritar jogo
- `POST /api/games/:id/like` - Curtir jogo

### Carteira
- `GET /api/wallet` - Saldo da carteira
- `POST /api/wallet/deposit` - Criar depósito
- `POST /api/wallet/withdraw` - Solicitar saque
- `GET /api/wallet/transactions` - Histórico

### Perfil
- `GET /api/profile` - Ver perfil
- `PUT /api/profile` - Atualizar perfil
- `GET /api/profile/favorites` - Jogos favoritos
- `GET /api/profile/recents` - Jogos recentes

## 🎮 Integrações

### PGSoft
Integração com provider de jogos PGSoft incluindo webhooks para transações.

### Asaas
Gateway de pagamento PIX para depósitos.

## 📝 License

MIT

