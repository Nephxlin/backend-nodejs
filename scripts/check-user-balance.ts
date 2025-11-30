import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 3; // ID do usuário do token
  
  console.log(`🔍 Verificando saldo do usuário ${userId}...`);
  console.log('-------------------------------------------');
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
    },
  });
  
  if (!user) {
    console.log('❌ Usuário não encontrado!');
    await prisma.$disconnect();
    return;
  }
  
  console.log('👤 Usuário:', user.name, `(${user.email})`);
  console.log('');
  
  if (!user.wallet) {
    console.log('❌ Carteira não encontrada!');
    await prisma.$disconnect();
    return;
  }
  
  const wallet = user.wallet;
  const balance = Number(wallet.balance);
  const balanceBonus = Number(wallet.balanceBonus);
  const balanceWithdrawal = Number(wallet.balanceWithdrawal);
  const totalBalance = balance + balanceBonus;
  
  console.log('💰 Saldos:');
  console.log('   Balance (principal):', balance.toFixed(2));
  console.log('   Balance Bonus:', balanceBonus.toFixed(2));
  console.log('   Balance Withdrawal:', balanceWithdrawal.toFixed(2));
  console.log('   TOTAL (balance + bonus):', totalBalance.toFixed(2));
  console.log('');
  
  if (totalBalance <= 0) {
    console.log('❌ PROBLEMA: Saldo total é 0 ou negativo!');
    console.log('   O backend está rejeitando o lançamento do jogo.');
    console.log('');
    console.log('💡 Solução: Adicione saldo ao usuário:');
    console.log(`   UPDATE wallets SET balance = 1000 WHERE user_id = ${userId};`);
  } else {
    console.log('✅ Saldo OK - Usuário tem saldo suficiente');
  }
  
  console.log('-------------------------------------------');
  
  await prisma.$disconnect();
}

main().catch(console.error);


