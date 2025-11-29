@echo off
REM Script para criar arquivo .env com configuração SQLite (Windows)

(
echo # ===================================
echo # DATABASE - SQLite
echo # ===================================
echo DATABASE_URL="file:./prisma/dev.db"
echo.
echo # ===================================
echo # JWT
echo # ===================================
echo JWT_SECRET="seu-secret-super-seguro-aqui-mude-em-producao"
echo JWT_EXPIRES_IN="24h"
echo.
echo # ===================================
echo # SERVER
echo # ===================================
echo PORT=3000
echo NODE_ENV="development"
echo.
echo # ===================================
echo # CURRENCY
echo # ===================================
echo CURRENCY_CODE="BRL"
echo CURRENCY_SYMBOL="R$"
echo.
echo # ===================================
echo # ASAAS GATEWAY
echo # ===================================
echo ASAAS_API_KEY="sua-api-key-asaas"
echo ASAAS_API_URL="https://www.asaas.com/api/v3"
echo ASAAS_WALLET_ID=""
echo.
echo # ===================================
echo # PGSOFT INTEGRATION
echo # ===================================
echo PGSOFT_API_URL="http://localhost:4000"
echo PGSOFT_AGENT_ID="seu-agent-id"
echo PGSOFT_SECRET_KEY="sua-secret-key"
echo.
echo # ===================================
echo # EMAIL ^(Opcional^)
echo # ===================================
echo MAIL_HOST=""
echo MAIL_PORT=""
echo MAIL_USER=""
echo MAIL_PASS=""
echo MAIL_FROM=""
echo.
echo # ===================================
echo # APP URLS
echo # ===================================
echo APP_URL="http://localhost:3005"
echo FRONTEND_URL="http://localhost:3006"
echo ADMIN_PANEL_URL="http://localhost:3001"
echo ASAAS_PAYMENT_API_URL="http://localhost:3000"
) > .env

echo.
echo ===============================================
echo    ARQUIVO .env CRIADO COM SUCESSO!
echo ===============================================
echo.
echo Configurado para usar SQLite: file:./prisma/dev.db
echo.
echo IMPORTANTE: Configure as variaveis secretas antes de usar em producao:
echo    - JWT_SECRET
echo    - ASAAS_API_KEY  
echo    - PGSOFT_AGENT_ID
echo    - PGSOFT_SECRET_KEY
echo.
pause

