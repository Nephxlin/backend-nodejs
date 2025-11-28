/**
 * BUSCAR FORTUNE RABBIT NO BANCO
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findRabbit() {
    try {
        console.log('\n🐰 BUSCANDO FORTUNE RABBIT');
        console.log('============================================================\n');

        // Buscar Fortune Rabbit
        const games = await prisma.game.findMany({
            where: {
                OR: [
                    { gameName: { contains: 'rabbit', mode: 'insensitive' } },
                    { gameCode: { contains: 'rabbit', mode: 'insensitive' } },
                ]
            },
            include: {
                provider: true,
            }
        });

        if (games.length === 0) {
            console.log('❌ Fortune Rabbit não encontrado no banco!');
            console.log('\n📋 Listando todos os jogos PGSoft:');
            const allPGSoft = await prisma.game.findMany({
                where: {
                    provider: {
                        code: 'pgsoft'
                    }
                },
                select: {
                    id: true,
                    gameName: true,
                    gameCode: true,
                    status: true,
                }
            });
            console.table(allPGSoft);
            return;
        }

        console.log(`✅ ${games.length} jogo(s) encontrado(s):\n`);

        games.forEach(game => {
            console.log(`\n📌 ID: ${game.id}`);
            console.log(`🎮 Nome: ${game.gameName}`);
            console.log(`🔖 Código: ${game.gameCode}`);
            console.log(`🏢 Provider: ${game.provider.name}`);
            console.log(`📊 Status: ${game.status === 1 ? '✅ Ativo' : '❌ Inativo'}`);
            console.log(`🆔 SLUG: /games/${game.id}/${game.gameCode}`);
        });

        console.log('\n============================================================');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

findRabbit();





