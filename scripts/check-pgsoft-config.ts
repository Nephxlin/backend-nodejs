import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const gamesKeys = await prisma.gamesKey.findFirst();
  
  console.log('🔍 Configuração PGSoft no banco de dados:');
  console.log('-------------------------------------------');
  console.log('pgsoft (API URL):', gamesKeys?.pgsoft || 'NÃO CONFIGURADO');
  console.log('pgsoftGameUrl:', gamesKeys?.pgsoftGameUrl || 'NÃO CONFIGURADO');
  console.log('pgsoftSecretKey:', gamesKeys?.pgsoftSecretKey ? '***' : 'NÃO CONFIGURADO');
  console.log('agentToken:', gamesKeys?.agentToken ? '***' : 'NÃO CONFIGURADO');
  console.log('-------------------------------------------');
  
  if (!gamesKeys?.pgsoft) {
    console.log('❌ ERRO: URL da API PGSoft não está configurada!');
    console.log('Configure através do admin-panel em /dashboard/settings');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);

