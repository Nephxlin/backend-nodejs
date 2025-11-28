# ✅ Correção Aplicada - Saldo Disponível para Saque

## 📋 Resumo

**Problema:** Após depósito via PIX, o `balanceWithdrawal` (saldo disponível para saque) não era atualizado.

**Solução:** Adicionado incremento do `balanceWithdrawal` no método `finalizePayment()`.

## 🔧 Alteração Realizada

### Arquivo: `backend-nodejs/src/services/deposit.service.ts`

**Linha ~167**: Adicionado após incrementar o saldo principal:

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

## 📊 Fluxo Completo de Depósito (Após Correção)

### Exemplo: Depósito de R$ 5,00 com bônus de 100% aceito

**Entrada:**
- Valor: R$ 5,00
- Aceita bônus: Sim
- Bônus: 100%
- Rollover: 2x

**Saída (Carteira Atualizada):**

| Campo | Valor | Descrição |
|-------|-------|-----------|
| `balance` | R$ 5,00 | Saldo jogável (valor depositado) |
| `balanceBonus` | R$ 5,00 | Bônus de 100% |
| `balanceWithdrawal` | **R$ 5,00** | ✅ **Disponível para saque** |
| `balanceBonusRollover` | R$ 10,00 | Rollover do bônus (5 × 2) |
| `balanceDepositRollover` | R$ 10,00 | Rollover do depósito (5 × 2) |

### Explicação do Rollover

O usuário precisa **apostar R$ 20,00** (R$ 10,00 do bônus + R$ 10,00 do depósito) antes de poder sacar.

- **Antes:** Apenas `balance` tinha valor, `balanceWithdrawal` ficava zerado
- **Agora:** Ambos `balance` e `balanceWithdrawal` recebem o valor depositado

## 🎯 Integração com o Sistema de Jogos

### Como o rollover funciona (PGSoft):

1. **Aposta realizada:**
   - Deduz de `balance` (ou `balanceBonus`)
   - Decrementa `balanceBonusRollover` e `balanceDepositRollover`

2. **Rollover cumprido:**
   - Quando ambos chegam a 0
   - `balanceWithdrawal` recebe todo o `balance` atual
   - Usuário pode solicitar saque

3. **Com esta correção:**
   - `balanceWithdrawal` já inicia com o valor depositado
   - Conforme o rollover é cumprido, mais saldo fica disponível

## ✅ Validação

### Antes da Correção ❌
```json
{
  "balance": 5,
  "balanceWithdrawal": 0,  // ❌ Incorreto
  "balanceBonus": 5,
  "balanceBonusRollover": 10,
  "balanceDepositRollover": 10
}
```

### Depois da Correção ✅
```json
{
  "balance": 5,
  "balanceWithdrawal": 5,  // ✅ Correto
  "balanceBonus": 5,
  "balanceBonusRollover": 10,
  "balanceDepositRollover": 10
}
```

## 🔄 Métodos que Chamam `finalizePayment()`

1. **Verificação Manual** (`deposit.controller.ts`)
   - Endpoint: `POST /api/wallet/deposit/verify`
   - Usuário clica em "Verificar Pagamento"

2. **Webhook Asaas** (`deposit.controller.ts`)
   - Endpoint: `POST /api/wallet/webhook/asaas`
   - Asaas notifica pagamento confirmado

**Ambos agora atualizam o `balanceWithdrawal` corretamente! ✅**

## 🧪 Como Testar

1. **Fazer novo depósito:**
   ```bash
   POST /api/wallet/deposit
   {
     "amount": 10,
     "cpf": "12345678900",
     "accept_bonus": true
   }
   ```

2. **Pagar o PIX e verificar:**
   ```bash
   POST /api/wallet/deposit/verify
   {
     "idTransaction": "DEP_13_xxxxx"
   }
   ```

3. **Verificar carteira:**
   ```bash
   GET /api/profile
   ```

4. **Confirmar valores:**
   - ✅ `balance` = valor depositado
   - ✅ `balanceWithdrawal` = valor depositado
   - ✅ `balanceBonus` = bônus (se aplicável)

## 📝 Notas Importantes

- ✅ Correção aplicada no método central `finalizePayment()`
- ✅ Afeta tanto verificação manual quanto webhook
- ⚠️ Depósitos anteriores não são afetados
- ✅ Novos depósitos funcionarão corretamente
- ✅ Sem necessidade de reiniciar o servidor (se usar nodemon/ts-node-dev)

## 🚀 Status

**CORREÇÃO APLICADA E PRONTA PARA USO** ✅



