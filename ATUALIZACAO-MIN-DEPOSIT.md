# Atualização do Valor Mínimo de Depósito

## 🔍 Problema Identificado

O sistema tinha uma inconsistência entre frontend e backend:
- **Frontend**: Permitia depósitos a partir de R$ 5,00
- **Backend**: Rejeitava valores menores que R$ 10,00

## ✅ Correções Realizadas

### 1. Backend - Código Atualizado
- `src/services/admin/settings.service.ts` - Alterado valor padrão de 10 para 5
- `prisma/schema.prisma` - Alterado `@default(10)` para `@default(5)`

### 2. Scripts de Migração Criados

#### Opção 1: Script TypeScript (Recomendado)
```bash
cd backend-nodejs
npx ts-node scripts/update-min-deposit.ts
```

#### Opção 2: SQL Direto
Execute o arquivo `prisma/update-min-deposit.sql` diretamente no banco:
```sql
UPDATE settings SET min_deposit = 5 WHERE min_deposit = 10;
```

### 3. Após executar a migração

Se você alterou o schema do Prisma, execute:
```bash
cd backend-nodejs
npx prisma generate
```

## 🎯 Resultado

Após aplicar as correções:
- ✅ Depósitos de R$ 5,00 serão aceitos
- ✅ Frontend e backend estarão sincronizados
- ✅ Sem erros de validação para valores mínimos

## 📝 Notas

- O script de atualização é idempotente (pode ser executado múltiplas vezes sem problemas)
- Se houver múltiplos registros na tabela settings, todos serão atualizados
- O script verifica se o valor já está correto antes de atualizar

