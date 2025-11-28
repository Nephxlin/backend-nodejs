/**
 * Script para corrigir rollover de usuários que receberam signup bonus sem rollover
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSignupRollover() {
  console.log('🔍 Buscando configurações...\n');
  
  // Buscar configuração
  const setting = await prisma.setting.findFirst();
  if (!setting) {
    console.log('❌ Nenhuma configuração encontrada');
    return;
  }

  const signupBonus = Number(setting.signupBonus);
  const rolloverMultiplier = Number(setting.depositBonusRollover);

  console.log(`✅ Signup Bonus: R$ ${signupBonus.toFixed(2)}`);
  console.log(`✅ Multiplicador de Rollover: ${rolloverMultiplier}x`);
  console.log(`✅ Rollover esperado: R$ ${(signupBonus * rolloverMultiplier).toFixed(2)}\n`);

  // Buscar usuários com signup bonus mas sem rollover aplicado corretamente
  const users = await prisma.wallet.findMany({
    where: {
      balanceBonus: { gt: 0 },
      balanceBonusRollover: { equals: 0 },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (users.length === 0) {
    console.log('✅ Nenhum usuário precisa de correção!\n');
    return;
  }

  console.log(`⚠️  Encontrados ${users.length} usuários com bônus mas sem rollover:\n`);

  for (const wallet of users) {
    const bonusAmount = Number(wallet.balanceBonus);
    const expectedRollover = bonusAmount * rolloverMultiplier;

    console.log(`   👤 ${wallet.user.name} (${wallet.user.email})`);
    console.log(`      Bônus: R$ ${bonusAmount.toFixed(2)}`);
    console.log(`      Rollover atual: R$ ${Number(wallet.balanceBonusRollover).toFixed(2)}`);
    console.log(`      Rollover esperado: R$ ${expectedRollover.toFixed(2)}`);

    // Atualizar rollover
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balanceBonusRollover: expectedRollover,
      },
    });

    console.log(`      ✅ Rollover corrigido!\n`);
  }

  console.log(`\n🎉 ${users.length} usuário(s) corrigido(s) com sucesso!\n`);
}

fixSignupRollover()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
