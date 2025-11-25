import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { errorResponse } from '../utils/response';

/**
 * Middleware global de tratamento de erros
 */
export function errorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  // Log do erro
  logger.error('Erro capturado:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Erro de validação do Prisma
  if (error.code === 'P2002') {
    return errorResponse(res, 'Registro duplicado', 400);
  }

  // Erro de registro não encontrado do Prisma
  if (error.code === 'P2025') {
    return errorResponse(res, 'Registro não encontrado', 404);
  }

  // Erro de validação
  if (error.name === 'ValidationError') {
    return errorResponse(res, error.message, 400);
  }

  // Erro padrão
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';

  return errorResponse(res, message, statusCode);
}

/**
 * Middleware para rotas não encontradas
 */
export function notFoundMiddleware(req: Request, res: Response): Response {
  return errorResponse(res, `Rota ${req.path} não encontrada`, 404);
}

