# Dockerfile para a aplicação Node.js (opcional)
# Use este dockerfile se quiser rodar a aplicação também em container

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY yarn.lock ./

# Instalar dependências
RUN yarn install --frozen-lockfile

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN yarn prisma:generate

# Build da aplicação
RUN yarn build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY yarn.lock ./

# Instalar apenas dependências de produção
RUN yarn install --production --frozen-lockfile

# Copiar arquivos necessários do builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Criar diretório de logs
RUN mkdir -p logs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar
CMD ["node", "dist/app.js"]

