import express, { Application } from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import logger from './config/logger';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import { generalLimiter } from './middlewares/ratelimit.middleware';
import autoCancelService from './services/auto-cancel.service';

// Importar rotas
import authRoutes from './routes/auth.routes';
import walletRoutes from './routes/wallet.routes';
import gamesRoutes from './routes/games.routes';
import profileRoutes from './routes/profile.routes';
import missionsRoutes from './routes/missions.routes';
import spinRoutes from './routes/spin.routes';
import settingsRoutes from './routes/settings.routes';
import adminRoutes from './routes/admin.routes';
import pgsoftRoutes from './routes/pgsoft.routes';

const app: Application = express();

// ============================================
// CONFIGURAÇÕES DO EXPRESS
// ============================================

// Trust proxy - necessário para Coolify/proxies reversos
// Permite que o Express leia corretamente o IP real do cliente através de headers X-Forwarded-*
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARES GLOBAIS
// ============================================

// CORS - Permitir múltiplas origens para desenvolvimento
app.use(
  cors({
    origin: [
      `${process.env.FRONTEND_URL}`,
      `${process.env.ADMIN_PANEL_URL}`,
      `${process.env.ASAAS_PAYMENT_API_URL}`,
      `${process.env.PGSOFT_API_URL}`,
      `${process.env.APP_URL}`,
      'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '30mb' })); // Aumentar limite para upload de imagens
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Rate limiting
app.use(generalLimiter);

// Logger de requisições
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
});

// ============================================
// ROTAS
// ============================================

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/missions', missionsRoutes);
app.use('/api/spin', spinRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pgsoft', pgsoftRoutes); // Callbacks do PGSoft

// ============================================
// TRATAMENTO DE ERROS
// ============================================

// Rota não encontrada
app.use(notFoundMiddleware);

// Middleware de erro global
app.use(errorMiddleware);

// ============================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================

async function startServer() {
  try {
    // Conectar ao banco
    await connectDatabase();

    // Iniciar cronjob de auto-cancelamento
    // Executa a cada 1 minuto
    cron.schedule('* * * * *', async () => {
      try {
        await autoCancelService.run();
      } catch (error) {
        logger.error('[CRON] Erro ao executar auto-cancel:', error);
      }
    });
    logger.info('⏰ Cronjob de auto-cancelamento iniciado (executa a cada 1 minuto)');
    logger.info(`⏱️  Timeout configurado: ${autoCancelService.getTimeoutMinutes()} minutos`);

    // Iniciar servidor
    app.listen(config.port, () => {
      logger.info(`🚀 Servidor rodando na porta ${config.port}`);
      logger.info(`📡 Ambiente: ${config.nodeEnv}`);
      logger.info(`🌐 URL: ${config.appUrl}`);
    });
  } catch (error) {
    logger.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar
startServer();

export default app;

