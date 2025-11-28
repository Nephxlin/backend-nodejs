/**
 * VERIFICAR JOGO NO BANCO
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGame() {
    try {
        console.log('\n🎰 VERIFICANDO JOGO FORTUNE RABBIT');
        console.log('============================================================\n');

        // Buscar o jogo ID 1
        const game = await prisma.game.findUnique({
            where: { id: 1 },
            include: {
                provider: true,
            }
        });

        if (!game) {
            console.log('❌ Jogo ID 1 não encontrado no banco!');
            console.log('\n📋 Listando todos os jogos disponíveis:');
            const allGames = await prisma.game.findMany({
                select: {
                    id: true,
                    gameName: true,
                    gameCode: true,
                    status: true,
                }
            });
            console.table(allGames);
            return;
        }

        console.log('✅ Jogo encontrado!\n');
        console.log(`📌 ID: ${game.id}`);
        console.log(`🎮 Nome: ${game.gameName}`);
        console.log(`🔖 Código: ${game.gameCode}`);
        console.log(`🏢 Provider: ${game.provider.name} (${game.provider.code})`);
        console.log(`🌐 URL: ${game.gameServerUrl}`);
        console.log(`📊 Status: ${game.status === 1 ? '✅ Ativo' : '❌ Inativo'}`);
        console.log(`📱 Mobile: ${game.isMobile === 1 ? 'Sim' : 'Não'}`);
        console.log(`🆓 Only Demo: ${game.onlyDemo === 1 ? 'Sim' : 'Não'}`);

        if (game.status !== 1) {
            console.log('\n❌ PROBLEMA: O jogo está INATIVO!');
            console.log('   Ative o jogo no banco de dados para poder jogar.');
        } else {
            console.log('\n✅ Jogo está ATIVO e pronto para jogar!');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkGame();





