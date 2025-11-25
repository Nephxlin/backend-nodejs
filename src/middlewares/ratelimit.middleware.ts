import rateLimit from 'express-rate-limit';

/**
 * Rate limiter geral
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: {
    status: false,
    error: 'Muitas requisições. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para autenticação (mais restritivo)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas de login
  message: {
    status: false,
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para criação de recursos
 */
export const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 criações por minuto
  message: {
    status: false,
    error: 'Muitas criações. Aguarde um momento.',
  },
});

