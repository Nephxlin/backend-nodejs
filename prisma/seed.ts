import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ============================================
  // 1. Criar Configurações do Sistema
  // ============================================
  console.log('📝 Criando configurações do sistema...');
  
  const setting = await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      softwareName: 'Cassino Cactus',
      softwareDescription: 'Plataforma de Cassino Online',
      currencyCode: 'BRL',
      prefix: 'R$',
      minDeposit: 10,
      maxDeposit: 10000,
      minWithdrawal: 20,
      maxWithdrawal: 5000,
      depositBonus: 100, // 100% de bônus no primeiro depósito
      depositBonusRollover: 30, // Rollover de 30x
      rolloverProtection: false,
      disableSpin: false,
      asaasIsEnable: false,
      affiliateBaseline: 50, // R$ 50 baseline para CPA
    },
  });

  console.log('✅ Configurações criadas:', setting.id);

  // ============================================
  // 2. Criar Moeda Padrão
  // ============================================
  console.log('💰 Criando moeda padrão...');
  
  const currency = await prisma.currency.upsert({
    where: { code: 'BRL' },
    update: {},
    create: {
      name: 'Real Brasileiro',
      code: 'BRL',
      symbol: 'R$',
      isActive: true,
    },
  });

  console.log('✅ Moeda criada:', currency.code);

  // ============================================
  // 3. Criar Configurações de Jogos (GamesKey)
  // ============================================
  console.log('🎮 Criando configurações de jogos...');
  
  const gamesKey = await prisma.gamesKey.upsert({
    where: { id: 1 },
    update: {
      apiEndpoint: 'http://localhost:3000',
      agentToken: 'test-agent-token',
      agentSecretKey: 'test-secret-key',
      pgsoft: 'http://localhost:3000',
      pgsoftSecretKey: 'test-pgsoft-secret',
      pgsoftGameUrl: 'http://localhost:3000',
      merchantUrl: 'http://localhost:3006',
    },
    create: {
      apiEndpoint: 'http://localhost:3000',
      agentToken: 'test-agent-token',
      agentSecretKey: 'test-secret-key',
      pgsoft: 'http://localhost:3000',
      pgsoftSecretKey: 'test-pgsoft-secret',
      pgsoftGameUrl: 'http://localhost:3000',
      merchantUrl: 'http://localhost:3006',
    },
  });

  console.log('✅ Configurações de jogos criadas com porta 3000');

  // ============================================
  // 4. Criar Gateway Asaas
  // ============================================
  console.log('💳 Criando gateway de pagamento...');
  
  const gateway = await prisma.gateway.upsert({
    where: { code: 'asaas' },
    update: {},
    create: {
      name: 'Asaas',
      code: 'asaas',
      apiKey: process.env.ASAAS_API_KEY || '',
      apiUrl: process.env.ASAAS_API_URL || 'https://www.asaas.com/api/v3',
      isActive: false, // Ativar quando configurar
    },
  });

  console.log('✅ Gateway criado:', gateway.name);

  // ============================================
  // 4. Criar Níveis VIP
  // ============================================
  console.log('👑 Criando níveis VIP...');
  
  const vipLevels = [
    { level: 1, name: 'Bronze', minPoints: 0, maxPoints: 1000 },
    { level: 2, name: 'Prata', minPoints: 1001, maxPoints: 5000 },
    { level: 3, name: 'Ouro', minPoints: 5001, maxPoints: 20000 },
    { level: 4, name: 'Platina', minPoints: 20001, maxPoints: 50000 },
    { level: 5, name: 'Diamante', minPoints: 50001, maxPoints: 999999999 },
  ];

  for (const vipLevel of vipLevels) {
    await prisma.vip.upsert({
      where: { level: vipLevel.level },
      update: {},
      create: {
        level: vipLevel.level,
        name: vipLevel.name,
        minPoints: vipLevel.minPoints,
        maxPoints: vipLevel.maxPoints,
        benefits: `Benefícios do nível ${vipLevel.name}`,
      },
    });
  }

  console.log('✅ Níveis VIP criados: 5 níveis');

  // ============================================
  // 5. Criar Categorias de Jogos
  // ============================================
  console.log('🎮 Criando categorias de jogos...');
  
  const categories = [
    { name: 'Slots', slug: 'slots', description: 'Jogos de slots' },
    { name: 'Cassino ao Vivo', slug: 'live-casino', description: 'Jogos ao vivo com dealers reais' },
    { name: 'Crash', slug: 'crash', description: 'Jogos crash' },
    { name: 'Populares', slug: 'popular', description: 'Jogos mais populares' },
    { name: 'Novos', slug: 'new', description: 'Lançamentos recentes' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categorias criadas: 5 categorias');

  // ============================================
  // 6. Criar Configuração do Spin
  // ============================================
  console.log('🎰 Criando configuração da roleta...');
  
  const spinConfig = {
    prizes: JSON.stringify([
      { value: 5, probability: 30, label: 'R$ 5' },
      { value: 10, probability: 25, label: 'R$ 10' },
      { value: 20, probability: 20, label: 'R$ 20' },
      { value: 50, probability: 15, label: 'R$ 50' },
      { value: 100, probability: 8, label: 'R$ 100' },
      { value: 500, probability: 2, label: 'R$ 500' },
    ]),
  };

  const spin = await prisma.spinConfig.upsert({
    where: { id: 1 },
    update: {},
    create: spinConfig,
  });

  console.log('✅ Configuração do spin criada');

  // ============================================
  // 7. Criar Usuário Admin
  // ============================================
  console.log('👤 Criando usuário administrador...');
  
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  // Gerar código de convite único
  const inviterCode = 'ADMIN001';

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cassino.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@cassino.com',
      cpf: '00000000000',
      phone: '11999999999',
      password: adminPassword,
      isAdmin: true,
      inviterCode,
      language: 'pt',
      banned: false,
      affiliateRevenueShare: 10, // 10% de revenue share
      affiliateCpa: 50, // R$ 50 por CPA
      affiliateBaseline: 50, // R$ 50 baseline
    },
  });

  console.log('✅ Admin criado:', admin.email);

  // ============================================
  // 8. Criar Carteira do Admin
  // ============================================
  console.log('💰 Criando carteira do admin...');
  
  const adminWallet = await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      currency: 'BRL',
      symbol: 'R$',
      balance: 10000, // R$ 10.000 de saldo inicial para testes
      active: true,
    },
  });

  console.log('✅ Carteira do admin criada com R$ 10.000');

  // ============================================
  // 9. Criar Banner de Exemplo
  // ============================================
  console.log('🎨 Criando banner de exemplo...');
  
  const banner = await prisma.banner.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Bem-vindo ao Cassino Cactus',
      description: 'Ganhe até 100% de bônus no primeiro depósito!',
      image: '/images/banner-welcome.jpg',
      link: '/games',
      isActive: true,
    },
  });

  console.log('✅ Banner criado');

  // ============================================
  // RESUMO
  // ============================================
  console.log('\n✅ ========================================');
  console.log('✅ Seed concluído com sucesso!');
  console.log('✅ ========================================\n');
  
  console.log('📊 Dados criados:');
  console.log('   - 1 Configuração do sistema');
  console.log('   - 1 Moeda (BRL)');
  console.log('   - 1 Gateway (Asaas)');
  console.log('   - 5 Níveis VIP');
  console.log('   - 5 Categorias de jogos');
  console.log('   - 1 Configuração de roleta');
  console.log('   - 1 Usuário admin');
  console.log('   - 1 Carteira do admin');
  console.log('   - 1 Banner');
  
  console.log('\n🔐 Credenciais do Admin:');
  console.log('   Email: admin@cassino.com');
  console.log('   Senha: admin123');
  console.log('   Código de Convite: ADMIN001');
  console.log('\n⚠️  IMPORTANTE: Altere a senha em produção!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

