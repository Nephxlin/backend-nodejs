# Manual Migrations Backup

Este diretório contém migrations SQL que foram aplicadas manualmente ao banco de dados antes de serem integradas ao sistema de migrations do Prisma.

## Migrations Consolidadas

Todas as migrations neste diretório foram consolidadas na migration:
`20251128000000_add_missing_features`

### Migrations Incluídas:

1. **add_rollover_history.sql**
   - Criou a tabela `rollover_history` para rastrear histórico de rollover
   - Campos: user_id, bet_amount, rollover_before, rollover_after, rollover_type, game_code

2. **add_signup_bonus.sql**
   - Adicionou coluna `signup_bonus` na tabela `settings`
   - Tipo: DECIMAL(20,2), Default: 0

3. **add_deposit_bonus_first_only.sql**
   - Adicionou coluna `deposit_bonus_first_only` na tabela `settings`
   - Tipo: BOOLEAN, Default: true
   - Controla se o bônus de depósito é apenas para o primeiro depósito

4. **create_kwai_pixels_table.sql**
   - Criou a tabela `kwai_pixels` para gerenciar pixels do Kwai
   - Campos: pixel_id (unique), access_token, name, description, is_active

## Status

✅ Todas as migrations foram aplicadas com sucesso no banco de dados
✅ Schema do Prisma está sincronizado com o banco de dados
✅ Migration consolidada `20251128000000_add_missing_features` foi marcada como aplicada

## Nota

Estes arquivos são mantidos apenas para referência histórica. Não devem ser aplicados novamente.

