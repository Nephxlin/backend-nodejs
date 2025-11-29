#!/bin/bash

# Script para criar arquivo .env com configuração SQLite

cat > .env << 'EOF'
# ===================================
# DATABASE - SQLite
# ===================================
DATABASE_URL="file:./prisma/dev.db"

# ===================================
# JWT
# ===================================
JWT_SECRET="seu-secret-super-seguro-aqui-mude-em-producao"
JWT_EXPIRES_IN="24h"

# ===================================
# SERVER
# ===================================
PORT=3000
NODE_ENV="development"

# ===================================
# CURRENCY
# ===================================
CURRENCY_CODE="BRL"
CURRENCY_SYMBOL="R$"

# ===================================
# ASAAS GATEWAY
# ===================================
ASAAS_API_KEY="sua-api-key-asaas"
ASAAS_API_URL="https://www.asaas.com/api/v3"
ASAAS_WALLET_ID=""

# ===================================
# PGSOFT INTEGRATION
# ===================================
PGSOFT_API_URL="http://localhost:4000"
PGSOFT_AGENT_ID="seu-agent-id"
PGSOFT_SECRET_KEY="sua-secret-key"

# ===================================
# EMAIL (Opcional)
# ===================================
MAIL_HOST=""
MAIL_PORT=""
MAIL_USER=""
MAIL_PASS=""
MAIL_FROM=""

# ===================================
# APP URLS
# ===================================
APP_URL="http://localhost:3005"
FRONTEND_URL="http://localhost:3006"
ADMIN_PANEL_URL="http://localhost:3001"
ASAAS_PAYMENT_API_URL="http://localhost:3000"
EOF

echo "✅ Arquivo .env criado com sucesso!"
echo "📁 Configurado para usar SQLite: file:./prisma/dev.db"
echo ""
echo "⚠️  IMPORTANTE: Configure as variáveis secretas antes de usar em produção:"
echo "   - JWT_SECRET"
echo "   - ASAAS_API_KEY"
echo "   - PGSOFT_AGENT_ID"
echo "   - PGSOFT_SECRET_KEY"

