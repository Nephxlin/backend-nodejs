#!/usr/bin/env node

/**
 * Script de Diagnóstico - Conexão com API PGSoft
 * 
 * Verifica se a API PGSoft está configurada e acessível
 */

const { PrismaClient } = require('@prisma/client')
const axios = require('axios')
const chalk = require('chalk')

const prisma = new PrismaClient()

async function main() {
  console.log(chalk.bold.blue('\n🔍 Diagnóstico de Conexão PGSoft\n'))
  console.log(chalk.gray('='.repeat(50)) + '\n')

  let hasErrors = false

  // 1. Verificar configuração no banco
  console.log(chalk.yellow('1️⃣  Verificando configuração no banco de dados...'))
  
  try {
    const gamesKey = await prisma.gamesKey.findFirst()
    
    if (!gamesKey) {
      console.log(chalk.red('   ❌ Nenhuma configuração encontrada na tabela games_keys'))
      hasErrors = true
    } else {
      if (!gamesKey.pgsoft) {
        console.log(chalk.red('   ❌ Campo "pgsoft" (URL da API) não está configurado'))
        hasErrors = true
      } else {
        console.log(chalk.green(`   ✅ URL da API PGSoft: ${gamesKey.pgsoft}`))
      }

      if (!gamesKey.agentToken) {
        console.log(chalk.yellow('   ⚠️  Campo "agentToken" não está configurado'))
      } else {
        console.log(chalk.green(`   ✅ Agent Token: ${gamesKey.agentToken.substring(0, 10)}...`))
      }

      if (!gamesKey.pgsoftSecretKey) {
        console.log(chalk.yellow('   ⚠️  Campo "pgsoftSecretKey" não está configurado'))
      } else {
        console.log(chalk.green(`   ✅ Secret Key: ${gamesKey.pgsoftSecretKey.substring(0, 10)}...`))
      }

      if (!gamesKey.pgsoftGameUrl) {
        console.log(chalk.yellow('   ⚠️  Campo "pgsoftGameUrl" não está configurado'))
      } else {
        console.log(chalk.green(`   ✅ Game URL: ${gamesKey.pgsoftGameUrl}`))
      }

      // 2. Testar conectividade
      if (gamesKey.pgsoft) {
        console.log(chalk.yellow('\n2️⃣  Testando conectividade com a API PGSoft...'))
        
        try {
          const testUrl = `${gamesKey.pgsoft}/api/v1/game_launch`
          console.log(chalk.gray(`   Endpoint: ${testUrl}`))
          
          const testPayload = {
            agentToken: gamesKey.agentToken || 'test',
            secretKey: gamesKey.pgsoftSecretKey || 'test',
            user_code: '1',
            game_code: 'fortune-tiger',
            provider_code: 'PGSOFT',
            game_type: 'slot',
            user_balance: 100.00,
            lang: 'pt',
            game_url: gamesKey.pgsoftGameUrl || 'http://localhost:3006/games'
          }

          const response = await axios.post(testUrl, testPayload, {
            timeout: 10000,
            validateStatus: () => true, // Aceitar qualquer status
          })

          if (response.status >= 200 && response.status < 300) {
            console.log(chalk.green(`   ✅ API respondeu com status ${response.status}`))
            
            if (response.data && response.data.launch_url) {
              console.log(chalk.green('   ✅ Launch URL recebida com sucesso'))
            } else if (response.data) {
              console.log(chalk.yellow('   ⚠️  API respondeu mas sem launch_url'))
              console.log(chalk.gray('   Resposta:', JSON.stringify(response.data, null, 2)))
            }
          } else if (response.status === 401 || response.status === 403) {
            console.log(chalk.red(`   ❌ Erro de autenticação (${response.status})`))
            console.log(chalk.yellow('   💡 Verifique se agentToken e secretKey estão corretos'))
            hasErrors = true
          } else {
            console.log(chalk.red(`   ❌ API respondeu com erro ${response.status}`))
            console.log(chalk.gray('   Resposta:', JSON.stringify(response.data, null, 2)))
            hasErrors = true
          }

        } catch (error) {
          if (error.code === 'ECONNREFUSED') {
            console.log(chalk.red('   ❌ Conexão recusada - API PGSoft não está rodando'))
            console.log(chalk.yellow('   💡 Inicie a API com: cd felps/api-pgsoft-node && yarn dev'))
            hasErrors = true
          } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
            console.log(chalk.red('   ❌ Timeout - API demorou muito para responder'))
            console.log(chalk.yellow('   💡 Verifique se a API está saudável'))
            hasErrors = true
          } else if (error.code === 'ENOTFOUND') {
            console.log(chalk.red('   ❌ Host não encontrado - URL pode estar incorreta'))
            console.log(chalk.yellow(`   💡 URL configurada: ${gamesKey.pgsoft}`))
            hasErrors = true
          } else {
            console.log(chalk.red(`   ❌ Erro ao conectar: ${error.message}`))
            hasErrors = true
          }
        }
      }
    }

    // 3. Verificar se existem jogos PGSoft
    console.log(chalk.yellow('\n3️⃣  Verificando jogos PGSoft no banco...'))
    
    const pgsoftProvider = await prisma.provider.findFirst({
      where: {
        code: 'pgsoft'
      }
    })

    if (!pgsoftProvider) {
      console.log(chalk.yellow('   ⚠️  Provider PGSoft não encontrado'))
      console.log(chalk.gray('   Você pode precisar criar o provider primeiro'))
    } else {
      const gamesCount = await prisma.game.count({
        where: {
          providerId: pgsoftProvider.id
        }
      })

      console.log(chalk.green(`   ✅ Provider PGSoft encontrado (ID: ${pgsoftProvider.id})`))
      console.log(chalk.green(`   ✅ Total de jogos PGSoft: ${gamesCount}`))
    }

  } catch (error) {
    console.log(chalk.red(`   ❌ Erro ao verificar: ${error.message}`))
    hasErrors = true
  }

  // Resumo
  console.log(chalk.gray('\n' + '='.repeat(50)))
  
  if (hasErrors) {
    console.log(chalk.red.bold('\n❌ PROBLEMAS ENCONTRADOS\n'))
    console.log(chalk.yellow('📖 Consulte o guia completo em:'))
    console.log(chalk.cyan('   GAME_LAUNCH_TIMEOUT_FIX.md\n'))
  } else {
    console.log(chalk.green.bold('\n✅ TUDO CONFIGURADO CORRETAMENTE!\n'))
    console.log(chalk.gray('Você pode tentar lançar um jogo agora.\n'))
  }

  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error(chalk.red('\n💥 Erro fatal:'), error)
    process.exit(1)
  })

