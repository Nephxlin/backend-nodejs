import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
  const userId = 3;
  
  console.log('🔧 Corrigindo sessão do jogo...');
  console.log('');
  
  // 1. Verificar usuário no PostgreSQL
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true }
  });
  
  if (!user || !user.wallet) {
    console.log('❌ Usuário não encontrado!');
    return;
  }
  
  console.log(`✅ Usuário encontrado: ${user.name} (${user.email})`);
  console.log(`💰 Saldo: R$ ${Number(user.wallet.balance) + Number(user.wallet.balanceBonus)}`);
  console.log('');
  
  // 2. Relançar o jogo para obter novo token
  console.log('🎮 Relançando o jogo...');
  
  try {
    const response = await axios.post(
      'http://localhost:3005/api/games/1/launch',
      {},
      {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_TOKEN || 'SEU_TOKEN_AQUI'}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    if (response.data.status) {
      console.log('✅ Jogo relançado com sucesso!');
      console.log('');
      console.log('🔗 Nova URL do jogo:');
      console.log(response.data.data.gameUrl);
      console.log('');
      console.log('💡 Use esta nova URL para jogar!');
    } else {
      console.log('❌ Erro ao relançar o jogo:', response.data.error || response.data.message);
    }
  } catch (error: any) {
    console.log('❌ Erro ao relançar o jogo:', error.message);
    console.log('');
    console.log('💡 Solução: Relance o jogo manualmente através do frontend');
    console.log('   URL: http://localhost:3006/games/1/fortune-tiger');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);


