import { PrismaClient } from '@prisma/client';

// Instância do Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Conexão com o banco
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao PostgreSQL');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error);
    process.exit(1);
  }
}

// Desconexão do banco
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export default prisma;

