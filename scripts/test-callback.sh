#!/bin/bash

echo "🧪 Testando callback user_balance..."
echo ""

response=$(curl -s -X POST http://localhost:3005/api/pgsoft/user_balance \
  -H "Content-Type: application/json" \
  -d '{"user_code":"3"}')

echo "📩 Resposta do backend:"
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
echo ""

# Extrair valores
status=$(echo "$response" | grep -oP '(?<="status":)\d+')
msg=$(echo "$response" | grep -oP '(?<="msg":")([^"]+)')
balance=$(echo "$response" | grep -oP '(?<="user_balance":)[0-9.]+')

echo "🔍 Análise:"
echo "   Status: $status"
echo "   Mensagem: $msg"
echo "   Saldo: $balance"
echo ""

if [ "$status" == "1" ] && [ "$msg" == "SUCCESS" ]; then
    echo "✅ Callback funcionando corretamente!"
else
    echo "❌ Problema no callback!"
fi


