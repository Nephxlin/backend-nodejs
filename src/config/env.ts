import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3006',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // Currency
  currencyCode: process.env.CURRENCY_CODE || 'BRL',
  currencySymbol: process.env.CURRENCY_SYMBOL || 'R$',

  // Asaas
  asaas: {
    apiKey: process.env.ASAAS_API_KEY || '',
    apiUrl: process.env.ASAAS_API_URL || 'https://www.asaas.com/api/v3',
    walletId: process.env.ASAAS_WALLET_ID || '',
  },

  // Asaas Payment API (Microservice)
  asaasPaymentApi: {
    baseUrl: process.env.ASAAS_PAYMENT_API_URL || 'http://localhost:3000',
  },

  // PGSoft
  pgsoft: {
    apiUrl: process.env.PGSOFT_API_URL || 'http://localhost:4000',
    agentId: process.env.PGSOFT_AGENT_ID || '',
    secretKey: process.env.PGSOFT_SECRET_KEY || '',
  },

  // Email (opcional)
  mail: {
    host: process.env.MAIL_HOST || '',
    port: parseInt(process.env.MAIL_PORT || '587'),
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || 'noreply@cassino.com',
  },
};

