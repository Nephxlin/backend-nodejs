#!/usr/bin/env node
/**
 * Script para corrigir URLs do PGSoft no PostgreSQL
 * 
 * Uso:
 *   node scripts/fix-pgsoft-urls.js
 * 
 * Este script:
 * - Verifica as URLs configuradas no banco
 * - Detecta se há URLs de produção
 * - Atualiza para URLs de desenvolvimento local
 * - Limpa pgsoftGameUrl para usar DOMINIO_API do motor
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando configurações PGSoft no PostgreSQL...\n');

  const gamesKey = await prisma.gamesKey.findFirst();

  if (!gamesKey) {
    console.log('❌ Nenhuma configuração encontrada!');
    console.log('\n💡 Dica: Execute as migrations primeiro:');
    console.log('   npx prisma migrate deploy');
    return;
  }

  console.log('📋 Configuração atual:');
  console.log('  - pgsoft:', gamesKey.pgsoft || '(vazio)');
  console.log('  - pgsoftGameUrl:', gamesKey.pgsoftGameUrl || '(vazio)');
  console.log('  - apiEndpoint:', gamesKey.apiEndpoint || '(vazio)');
  console.log('  - agentToken:', gamesKey.agentToken ? '***' : '(vazio)');
  console.log('  - pgsoftSecretKey:', gamesKey.pgsoftSecretKey ? '***' : '(vazio)');
  console.log('');

  // Verificar se alguma URL está apontando para produção
  const prodUrls = [
    'cs.redformas.shop',
    'https://cs.redformas.shop',
    'api.redformas.shop',
    'https://api.redformas.shop',
    'plain-opposite-mozilla-highways.trycloudflare.com'
  ];
  
  const hasProdUrl = 
    prodUrls.some(url => gamesKey.pgsoft?.includes(url)) ||
    prodUrls.some(url => gamesKey.pgsoftGameUrl?.includes(url)) ||
    prodUrls.some(url => gamesKey.apiEndpoint?.includes(url));

  if (hasProdUrl) {
    console.log('⚠️  ATENÇÃO: URLs de produção detectadas!');
    console.log('🔧 Atualizando para URLs locais...\n');

    await prisma.gamesKey.update({
      where: { id: gamesKey.id },
      data: {
        pgsoft: 'http://localhost:3000',
        pgsoftGameUrl: '', // Deixar vazio para usar DOMINIO_API do motor
        apiEndpoint: 'http://localhost:3005',
      },
    });

    console.log('✅ URLs atualizadas para desenvolvimento local:');
    console.log('  - pgsoft: http://localhost:3000');
    console.log('  - pgsoftGameUrl: (vazio - usará DOMINIO_API)');
    console.log('  - apiEndpoint: http://localhost:3005');
  } else {
    console.log('✅ URLs já estão configuradas para localhost!');
    
    // Garantir que pgsoftGameUrl está vazio
    if (gamesKey.pgsoftGameUrl) {
      console.log('🔧 Limpando pgsoftGameUrl para usar DOMINIO_API do motor...');
      await prisma.gamesKey.update({
        where: { id: gamesKey.id },
        data: {
          pgsoftGameUrl: '',
        },
      });
      console.log('✅ pgsoftGameUrl limpo!');
    }
  }

  console.log('\n📝 Configuração final:');
  const updated = await prisma.gamesKey.findFirst();
  console.log('  - pgsoft:', updated.pgsoft);
  console.log('  - pgsoftGameUrl:', updated.pgsoftGameUrl || '(vazio - OK!)');
  console.log('  - apiEndpoint:', updated.apiEndpoint);
  
  console.log('\n🎯 Próximo passo:');
  console.log('  1. Verifique o .env da API PGSoft Node:');
  console.log('     - DOMINIO_API=http://localhost:3000');
  console.log('     - NODE_ENV=development');
  console.log('');
  console.log('  2. Verifique o agent no SQLite:');
  console.log('     sqlite3 E:\\app\\data\\database.sqlite');
  console.log('     SELECT callbackurl FROM agents WHERE agentcode = "CASINO_BACKEND";');
  console.log('     (deve ser: http://localhost:3005/api/)');
  console.log('');
  console.log('  3. Reinicie os serviços:');
  console.log('     - Motor PGSoft: cd felps/api-pgsoft-node && yarn dev');
  console.log('     - Backend: cd backend-nodejs && yarn dev');
  console.log('');
  console.log('  4. Teste o jogo: http://localhost:3006/games/1/fortune-tiger');
}

main()
  .catch(error => {
    console.error('❌ Erro ao executar script:', error.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
