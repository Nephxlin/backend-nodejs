import prisma from '../config/database';
import logger from '../config/logger';

async function updatePgsoftProduction() {
  try {
    logger.info('🔧 Atualizando URLs da API PGSoft para PRODUÇÃO...');
    
    const updatedKey = await prisma.gamesKey.updateMany({
      data: {
        pgsoft: 'https://cs.redformas.shop',
        pgsoftGameUrl: 'https://cs.redformas.shop',
      },
    });

    if (updatedKey.count > 0) {
      logger.info('✅ Configuração de produção atualizada com sucesso!');
      
      const gamesKey = await prisma.gamesKey.findFirst();
      logger.info('-------------------------------------------');
      logger.info(`   pgsoft (API URL): ${gamesKey?.pgsoft}`);
      logger.info(`   pgsoftGameUrl: ${gamesKey?.pgsoftGameUrl}`);
      logger.info('-------------------------------------------');
    } else {
      logger.warn('⚠️ Nenhuma configuração encontrada para atualizar.');
    }
  } catch (error: any) {
    logger.error('❌ Erro ao atualizar URL PGSoft:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePgsoftProduction();

