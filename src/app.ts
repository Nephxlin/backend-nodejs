import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import logger from './config/logger';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import { generalLimiter } from './middlewares/ratelimit.middleware';

// Importar rotas
import authRoutes from './routes/auth.routes';
import walletRoutes from './routes/wallet.routes';
import gamesRoutes from './routes/games.routes';
import profileRoutes from './routes/profile.routes';
import missionsRoutes from './routes/missions.routes';
import spinRoutes from './routes/spin.routes';
import settingsRoutes from './routes/settings.routes';

const app: Application = express();

// ============================================
// MIDDLEWARES GLOBAIS
// ============================================

// CORS
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(generalLimiter);

// Logger de requisições
app.use((req, res, next) => {
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
app.get('/health', (req, res) => {
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

