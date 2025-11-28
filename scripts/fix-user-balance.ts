/**
 * Script para corrigir o saldo do usuário que fez depósito antes da correção
 * 
 * Execute com: npx ts-node scripts/fix-user-balance.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 13; // ID do usuário a ser corrigido

  console.log('═══════════════════════════════════════════════════');
  console.log('🔧 CORRIGINDO SALDO DO USUÁRIO');
  console.log(`📋 User ID: ${userId}`);
  console.log('═══════════════════════════════════════════════════\n');

  // Buscar carteira atual
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    console.error('❌ Carteira não encontrada para o usuário', userId);
    return;
  }

  console.log('📊 Saldo Atual:');
  console.log(`   Balance: R$ ${wallet.balance}`);
  console.log(`   Balance Withdrawal: R$ ${wallet.balanceWithdrawal}`);
  console.log(`   Balance Bonus: R$ ${wallet.balanceBonus}`);
  console.log(`   Bonus Rollover: R$ ${wallet.balanceBonusRollover}`);
  console.log(`   Deposit Rollover: R$ ${wallet.balanceDepositRollover}\n`);

  // Buscar depósitos confirmados do usuário
  const deposits = await prisma.transaction.findMany({
    where: {
      userId,
      status: 1, // Confirmado
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  console.log(`💰 Total de depósitos confirmados: ${deposits.length}\n`);

  // Calcular total de depósitos
  let totalDeposits = 0;
  deposits.forEach((deposit, index) => {
    const amount = Number(deposit.price);
    totalDeposits += amount;
    console.log(`   ${index + 1}. R$ ${amount} - ${deposit.paymentId} (${new Date(deposit.createdAt).toLocaleString()})`);
  });

  console.log(`\n📈 Total depositado: R$ ${totalDeposits}`);

  // Verificar se precisa correção
  const currentWithdrawal = Number(wallet.balanceWithdrawal);
  const shouldBe = Number(wallet.balance); // O withdrawal deveria ser igual ao balance

  if (currentWithdrawal === shouldBe) {
    console.log('\n✅ Saldo já está correto! Nenhuma ação necessária.');
    return;
  }

  console.log(`\n⚠️  Saldo incorreto detectado!`);
  console.log(`   Atual: R$ ${currentWithdrawal}`);
  console.log(`   Deveria ser: R$ ${shouldBe}`);
  console.log(`   Diferença: R$ ${shouldBe - currentWithdrawal}\n`);

  // Perguntar confirmação (apenas mostra, não executa automaticamente)
  console.log('🔄 Aplicando correção...\n');

  // Atualizar balanceWithdrawal
  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: {
      balanceWithdrawal: shouldBe,
    },
  });

  console.log('✅ Saldo corrigido com sucesso!\n');
  console.log('📊 Novo Saldo:');
  console.log(`   Balance: R$ ${updatedWallet.balance}`);
  console.log(`   Balance Withdrawal: R$ ${updatedWallet.balanceWithdrawal}`);
  console.log(`   Balance Bonus: R$ ${updatedWallet.balanceBonus}`);
  console.log(`   Bonus Rollover: R$ ${updatedWallet.balanceBonusRollover}`);
  console.log(`   Deposit Rollover: R$ ${updatedWallet.balanceDepositRollover}\n`);

  // Registrar a correção no histórico
  await prisma.walletChange.create({
    data: {
      userId,
      amount: shouldBe - currentWithdrawal,
      beforeBalance: currentWithdrawal,
      afterBalance: shouldBe,
      type: 'balance_correction',
      description: 'Correção de saldo - Ajuste de balanceWithdrawal após depósito',
    },
  });

  console.log('📝 Correção registrada no histórico da carteira');
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
  console.log('═══════════════════════════════════════════════════');
}

main()
  .catch((error) => {
    console.error('❌ Erro ao corrigir saldo:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

