#!/usr/bin/env node

/**
 * Script de Configuração - API PGSoft
 * 
 * Configura automaticamente as credenciais da API PGSoft
 */

const { PrismaClient } = require('@prisma/client')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function main() {
  console.log('\n🔧 Configuração da API PGSoft\n')
  console.log('Este script irá configurar as credenciais da API PGSoft no banco de dados.\n')

  // Verificar se já existe configuração
  const existing = await prisma.gamesKey.findFirst()

  if (existing && existing.pgsoft) {
    console.log('⚠️  Já existe uma configuração:')
    console.log(`   URL da API: ${existing.pgsoft}`)
    console.log(`   Agent Token: ${existing.agentToken ? '***' : '(não configurado)'}`)
    console.log(`   Secret Key: ${existing.pgsoftSecretKey ? '***' : '(não configurado)'}`)
    console.log(`   Game URL: ${existing.pgsoftGameUrl || '(não configurado)'}\n`)
    
    const overwrite = await question('Deseja sobrescrever? (s/N): ')
    if (overwrite.toLowerCase() !== 's' && overwrite.toLowerCase() !== 'sim') {
      console.log('\n❌ Configuração cancelada.')
      rl.close()
      await prisma.$disconnect()
      return
    }
  }

  console.log('\n📝 Preencha as informações abaixo:\n')

  // Coletar informações
  const pgsoftUrl = await question('URL da API PGSoft (ex: http://localhost:3001): ')
  const agentToken = await question('Agent Token: ')
  const secretKey = await question('Secret Key: ')
  const gameUrl = await question('Game URL pública (ex: https://redformas.shop/games): ')

  // Validações básicas
  if (!pgsoftUrl || !pgsoftUrl.startsWith('http')) {
    console.log('\n❌ URL inválida. Deve começar com http:// ou https://')
    rl.close()
    await prisma.$disconnect()
    return
  }

  if (!agentToken) {
    console.log('\n⚠️  Agent Token não fornecido. Continuando sem...')
  }

  if (!secretKey) {
    console.log('\n⚠️  Secret Key não fornecida. Continuando sem...')
  }

  // Confirmar
  console.log('\n📋 Resumo da configuração:')
  console.log(`   URL da API: ${pgsoftUrl}`)
  console.log(`   Agent Token: ${agentToken ? agentToken.substring(0, 10) + '...' : '(vazio)'}`)
  console.log(`   Secret Key: ${secretKey ? secretKey.substring(0, 10) + '...' : '(vazio)'}`)
  console.log(`   Game URL: ${gameUrl || '(vazio)'}\n`)

  const confirm = await question('Confirmar e salvar? (s/N): ')
  if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'sim') {
    console.log('\n❌ Configuração cancelada.')
    rl.close()
    await prisma.$disconnect()
    return
  }

  // Salvar no banco
  try {
    const config = await prisma.gamesKey.upsert({
      where: { id: existing?.id || 1 },
      update: {
        pgsoft: pgsoftUrl,
        agentToken: agentToken || existing?.agentToken,
        pgsoftSecretKey: secretKey || existing?.pgsoftSecretKey,
        pgsoftGameUrl: gameUrl || existing?.pgsoftGameUrl,
      },
      create: {
        pgsoft: pgsoftUrl,
        agentToken: agentToken || undefined,
        pgsoftSecretKey: secretKey || undefined,
        pgsoftGameUrl: gameUrl || undefined,
      }
    })

    console.log('\n✅ Configuração salva com sucesso!')
    console.log(`   ID: ${config.id}\n`)

    console.log('🎯 Próximos passos:')
    console.log('   1. Certifique-se de que a API PGSoft está rodando:')
    console.log('      cd felps/api-pgsoft-node && yarn dev')
    console.log('   2. Teste a conexão:')
    console.log('      node scripts/check-pgsoft-connection.js')
    console.log('   3. Tente lançar um jogo no frontend\n')

  } catch (error) {
    console.error('\n❌ Erro ao salvar:', error.message)
  }

  rl.close()
  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error)
    process.exit(1)
  })

