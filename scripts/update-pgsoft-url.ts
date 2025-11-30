import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Atualizando URL da API PGSoft...');
  
  const gamesKeys = await prisma.gamesKey.findFirst();
  
  if (!gamesKeys) {
    console.log('❌ Nenhuma configuração encontrada. Criando...');
    await prisma.gamesKey.create({
      data: {
        pgsoft: 'http://localhost:4000',
        pgsoftGameUrl: 'https://cs.redformas.shop',
        pgsoftSecretKey: 'test-pgsoft-secret',
        agentToken: 'test-agent-token',
      },
    });
  } else {
    await prisma.gamesKey.update({
      where: { id: gamesKeys.id },
      data: {
        pgsoft: 'http://localhost:4000',
      },
    });
  }
  
  console.log('✅ Configuração atualizada com sucesso!');
  console.log('   pgsoft (API URL): http://localhost:4000');
  
  await prisma.$disconnect();
}

main().catch(console.error);

