import winston from 'winston';
import { config } from './env';

const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'cassino-api' },
  transports: [
    // Console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
    }),
    // Arquivo de erros
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Arquivo combinado
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;

