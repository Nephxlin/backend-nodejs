/**
 * Script para atualizar o valor mínimo de depósito de 10 para 5 reais
 * 
 * Execute com: npx ts-node scripts/update-min-deposit.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Atualizando valor mínimo de depósito...');

  const settings = await prisma.setting.findFirst();

  if (!settings) {
    console.log('⚠️  Nenhuma configuração encontrada no banco de dados');
    return;
  }

  console.log(`📊 Valor atual: R$ ${settings.minDeposit}`);

  if (Number(settings.minDeposit) === 5) {
    console.log('✅ Valor mínimo já está configurado como R$ 5,00');
    return;
  }

  const updated = await prisma.setting.update({
    where: { id: settings.id },
    data: { minDeposit: 5 }
  });

  console.log(`✅ Valor mínimo atualizado para: R$ ${updated.minDeposit}`);
  console.log('🎉 Atualização concluída com sucesso!');
}

main()
  .catch((error) => {
    console.error('❌ Erro ao atualizar:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

