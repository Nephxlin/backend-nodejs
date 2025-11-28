/**
 * VERIFICAR SALDO DO USUÁRIO
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBalance() {
    try {
        console.log('\n💰 VERIFICANDO SALDO DO USUÁRIO');
        console.log('============================================================\n');

        // Buscar todos os usuários e seus saldos
        const wallets = await prisma.wallet.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    }
                }
            }
        });

        if (wallets.length === 0) {
            console.log('❌ Nenhuma carteira encontrada!');
            return;
        }

        console.log(`✅ ${wallets.length} carteira(s) encontrada(s):\n`);

        wallets.forEach(wallet => {
            const balance = parseFloat(wallet.balance);
            const balanceBonus = parseFloat(wallet.balanceBonus);
            const total = balance + balanceBonus;

            console.log(`👤 Usuário: ${wallet.user.email} (ID: ${wallet.user.id})`);
            console.log(`   💵 Saldo principal: R$ ${balance.toFixed(2)}`);
            console.log(`   🎁 Saldo bônus: R$ ${balanceBonus.toFixed(2)}`);
            console.log(`   💰 Total: R$ ${total.toFixed(2)}`);
            
            if (total <= 0) {
                console.log(`   ⚠️  SALDO INSUFICIENTE! Adicione créditos para jogar.`);
            } else {
                console.log(`   ✅ Saldo OK!`);
            }
            console.log('');
        });

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkBalance();





