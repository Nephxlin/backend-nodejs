/**
 * Script para alterar o tamanho da coluna deposit_bonus_rollover
 * De Decimal(5,2) para Decimal(10,2)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRolloverColumn() {
  try {
    console.log('🔧 Alterando tamanho da coluna deposit_bonus_rollover...\n');
    
    // Executar SQL diretamente
    await prisma.$executeRaw`
      ALTER TABLE "settings" 
      ALTER COLUMN "deposit_bonus_rollover" TYPE DECIMAL(10, 2)
    `;
    
    console.log('✅ Coluna alterada com sucesso!');
    console.log('   Antes: Decimal(5,2) - Máx: 999.99');
    console.log('   Depois: Decimal(10,2) - Máx: 99.999.999,99\n');
    
    // Verificar valor atual
    const settings = await prisma.setting.findFirst();
    if (settings) {
      console.log('📊 Valor atual de depositBonusRollover:', Number(settings.depositBonusRollover));
    }
    
    console.log('\n🎉 Correção aplicada! Agora você pode usar valores maiores de rollover.');
    
  } catch (error) {
    console.error('❌ Erro ao alterar coluna:', error);
    console.log('\n📝 Execute manualmente no PostgreSQL:');
    console.log('   ALTER TABLE "settings" ALTER COLUMN "deposit_bonus_rollover" TYPE DECIMAL(10, 2);');
  } finally {
    await prisma.$disconnect();
  }
}

fixRolloverColumn();
