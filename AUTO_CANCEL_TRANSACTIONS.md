# 🤖 Sistema de Auto-Cancelamento de Transações

## 📋 Visão Geral

Sistema automático que cancela transações (depósitos e saques) que permanecem com status **"pendente"** por mais de **5 minutos**.

---

## ⚙️ Como Funciona

### Status das Transações

- **0** = Pendente (aguardando aprovação)
- **1** = Aprovado (processado com sucesso)
- **2** = Rejeitado/Não Pago (cancelado)

### Funcionamento Automático

1. **Cronjob** executa a cada **1 minuto**
2. Verifica depósitos e saques com status **0** (pendente)
3. Identifica transações criadas há **mais de 5 minutos**
4. Atualiza automaticamente o status para **2** (não pago)
5. Registra logs detalhados de cada cancelamento

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos

- `src/services/auto-cancel.service.ts` - Serviço de auto-cancelamento
- `AUTO_CANCEL_TRANSACTIONS.md` - Esta documentação

### Arquivos Modificados

- `src/app.ts` - Adicionado cronjob
- `package.json` - Adicionado `node-cron` e `@types/node-cron`

---

## 🔧 Configuração

### Alterar Timeout (Minutos)

Para mudar o tempo de expiração de 5 minutos para outro valor:

```typescript
// No arquivo src/app.ts, após connectDatabase():

// Exemplo: Mudar para 10 minutos
autoCancelService.setTimeoutMinutes(10);
```

### Alterar Frequência do Cronjob

No arquivo `src/app.ts`, linha do `cron.schedule`:

```typescript
// Executa a cada 1 minuto
cron.schedule('* * * * *', async () => {
  await autoCancelService.run();
});

// Executa a cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  await autoCancelService.run();
});

// Executa a cada 30 segundos (requer ajuste)
// Não recomendado - pode sobrecarregar o banco
```

### Sintaxe do Cron

```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Dia da semana (0-7, 0 e 7 = Domingo)
│ │ │ └─── Mês (1-12)
│ │ └───── Dia do mês (1-31)
│ └─────── Hora (0-23)
└───────── Minuto (0-59)
```

**Exemplos:**
- `* * * * *` - A cada 1 minuto
- `*/5 * * * *` - A cada 5 minutos
- `*/15 * * * *` - A cada 15 minutos
- `0 * * * *` - A cada hora (no minuto 0)

---

## 📊 Logs

### Logs Informativos

```
[AUTO-CANCEL] Iniciando verificação de transações expiradas...
[AUTO-CANCEL] 3 depósitos cancelados automaticamente (timeout de 5 minutos)
[AUTO-CANCEL] Depósito #123 cancelado - User: 45, Valor: 100.00, Pendente há: 6 minutos
[AUTO-CANCEL] Total cancelado: 3 depósitos, 2 saques
```

### Sem Transações Expiradas

```
[AUTO-CANCEL] Nenhuma transação expirada encontrada
```

### Logs de Erro

```
[CRON] Erro ao executar auto-cancel: Error: Database connection failed
[AUTO-CANCEL] Erro ao cancelar depósitos: Error: ...
```

---

## 🎯 Benefícios

1. **Limpeza Automática**
   - Remove transações abandonadas do sistema
   - Mantém o painel de administração limpo

2. **Melhor UX**
   - Usuários sabem rapidamente se sua transação expirou
   - Evita transações "fantasma" pendentes indefinidamente

3. **Controle Financeiro**
   - Status claro de todas as transações
   - Facilita reconciliação financeira

4. **Reduz Carga Manual**
   - Administradores não precisam cancelar manualmente
   - Processo totalmente automatizado

---

## 🔍 Monitoramento

### Verificar se está Rodando

Ao iniciar o servidor, você verá:

```
⏰ Cronjob de auto-cancelamento iniciado (executa a cada 1 minuto)
⏱️  Timeout configurado: 5 minutos
🚀 Servidor rodando na porta 3001
```

### Verificar Logs em Tempo Real

```bash
# Via terminal (se usando pm2 ou similar)
pm2 logs backend-nodejs

# Via arquivo de log
tail -f logs/combined.log | grep AUTO-CANCEL
```

---

## ⚠️ Avisos Importantes

### Não Afeta Transações Já Processadas

- ✅ Transações **aprovadas** (status 1) não são tocadas
- ✅ Transações **já rejeitadas** (status 2) não são tocadas
- ⚠️ Apenas transações **pendentes** (status 0) são afetadas

### Não Devolve Saldo

- Este sistema apenas **atualiza o status**
- **NÃO credita ou debita saldo** automaticamente
- Depósitos pendentes nunca foram creditados
- Saques pendentes: saldo já foi retido no momento da solicitação

---

## 🧪 Testando

### Teste Manual

```typescript
// Criar um teste rápido
import autoCancelService from './services/auto-cancel.service';

// Executar manualmente
await autoCancelService.run();

// Ou testar com timeout personalizado
autoCancelService.setTimeoutMinutes(1); // 1 minuto para testes
await autoCancelService.run();
```

### Verificar Banco de Dados

```sql
-- Ver depósitos pendentes antigos
SELECT id, userId, amount, status, createdAt, 
       TIMESTAMPDIFF(MINUTE, createdAt, NOW()) as minutes_pending
FROM deposits 
WHERE status = 0 
  AND createdAt < DATE_SUB(NOW(), INTERVAL 5 MINUTE);

-- Ver saques pendentes antigos
SELECT id, userId, amount, status, createdAt,
       TIMESTAMPDIFF(MINUTE, createdAt, NOW()) as minutes_pending
FROM withdrawals 
WHERE status = 0 
  AND createdAt < DATE_SUB(NOW(), INTERVAL 5 MINUTE);
```

---

## 🚀 Próximas Melhorias Possíveis

- [ ] Notificar usuário quando transação é auto-cancelada
- [ ] Permitir configuração via variável de ambiente
- [ ] Dashboard com estatísticas de cancelamentos
- [ ] Diferentes timeouts para depósitos e saques
- [ ] Webhook para notificar sistemas externos

---

## 📝 Notas de Desenvolvimento

**Data de Implementação:** 2024-11-30

**Versão:** 1.0.0

**Autor:** Sistema Automatizado

**Teste em:** Desenvolvimento ✅ | Produção ⏳

---

## 🆘 Troubleshooting

### Cronjob Não Está Executando

1. Verificar se o servidor iniciou corretamente
2. Verificar logs de erro no console
3. Verificar se `node-cron` está instalado: `yarn list node-cron`

### Transações Não Estão Sendo Canceladas

1. Verificar se o timeout está configurado corretamente
2. Verificar se há transações com status 0 e > 5 minutos
3. Verificar logs de erro: `grep AUTO-CANCEL logs/combined.log`
4. Executar manualmente para testar: `autoCancelService.run()`

### Performance

- O cronjob é **leve** e eficiente
- Usa `updateMany` para atualizar múltiplos registros de uma vez
- Apenas faz queries se houver transações para cancelar
- Não afeta a performance do servidor

---

## ✅ Conclusão

Sistema robusto e automático que mantém seu sistema limpo e organizado, cancelando automaticamente transações abandonadas após 5 minutos.

**Resultado:** Melhor controle financeiro e experiência do usuário! 🎯

