# Fix - Saldo Disponível para Saque não Atualizado

## 🔍 Problema Identificado

Após o pagamento do depósito, o `balanceWithdrawal` (saldo disponível para saque) não estava sendo atualizado, apenas o `balance` (saldo jogável).

### Resposta da API (Antes da Correção):
```json
"wallet": {
    "balance": 5,              // ✅ Atualizado
    "balanceBonus": 20,        // ✅ Atualizado (com bônus)
    "balanceWithdrawal": 0,    // ❌ NÃO atualizado (deveria ser 5)
    "balanceBonusRollover": 10,
    "balanceDepositRollover": 10,
    ...
}
```

## 🐛 Causa Raiz

No arquivo `backend-nodejs/src/services/deposit.service.ts`, o método `finalizePayment()` estava:

1. ✅ Adicionando ao `balance` (saldo jogável)
2. ✅ Adicionando ao `balanceBonus` (se aceitar bônus)
3. ✅ Configurando `balanceBonusRollover`
4. ✅ Configurando `balanceDepositRollover`
5. ❌ **NÃO estava adicionando ao `balanceWithdrawal`**

## ✅ Solução Aplicada

Adicionado incremento do `balanceWithdrawal` após adicionar o saldo principal.

### Arquivo: `backend-nodejs/src/services/deposit.service.ts`

**Código Adicionado (após linha 166):**
```typescript
// Adicionar saldo disponível para saque
await prisma.wallet.update({
  where: { id: wallet.id },
  data: {
    balanceWithdrawal: {
      increment: Number(transaction.price),
    },
  },
});
```

## 📊 Fluxo Correto de Depósito

### Exemplo: Depósito de R$ 5,00 com bônus de 100%

1. **Balance** (saldo jogável): R$ 5,00
2. **BalanceBonus** (bônus): R$ 5,00 (100% do depósito)
3. **BalanceWithdrawal** (disponível para saque): R$ 5,00 ✅ **AGORA ATUALIZADO**
4. **BalanceBonusRollover**: R$ 5,00 * rollover
5. **BalanceDepositRollover**: R$ 5,00 * rollover

### Resposta Esperada (Após Correção):
```json
"wallet": {
    "balance": 5,              // ✅ Valor depositado
    "balanceBonus": 5,         // ✅ Bônus de 100%
    "balanceWithdrawal": 5,    // ✅ Disponível para saque
    "balanceBonusRollover": 10, // ✅ Rollover do bônus (2x de 5)
    "balanceDepositRollover": 10, // ✅ Rollover do depósito (2x de 5)
    ...
}
```

## 🎯 Resultado

Agora quando um usuário fizer um depósito:
- ✅ O valor será creditado no `balance` (para jogar)
- ✅ O valor será creditado no `balanceWithdrawal` (para sacar após cumprir rollover)
- ✅ O bônus será creditado no `balanceBonus` (se aceitar)
- ✅ Os rollovers serão configurados corretamente

## 🧪 Como Testar

1. Fazer um novo depósito via PIX
2. Aguardar confirmação do pagamento
3. Verificar a carteira do usuário:
   ```bash
   GET /api/profile
   ```
4. Confirmar que todos os campos foram atualizados:
   - `balance` = valor depositado
   - `balanceWithdrawal` = valor depositado
   - `balanceBonus` = bônus (se aplicável)

## ⚠️ Observação

Esta correção afeta **apenas novos depósitos**. Depósitos já processados anteriormente não serão corrigidos automaticamente. Se necessário, pode-se criar um script de migração para ajustar depósitos anteriores.



