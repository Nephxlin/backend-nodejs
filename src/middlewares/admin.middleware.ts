import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

/**
 * Middleware para verificar se o usuário é admin
 * Deve ser usado após o authMiddleware
 */
export async function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  try {
    // Verifica se o usuário está autenticado
    if (!req.user) {
      return errorResponse(res, 'Não autenticado', 401);
    }

    // Verifica se o usuário é admin
    if (!req.user.isAdmin) {
      return errorResponse(
        res,
        'Acesso negado. Você não tem permissão de administrador.',
        403
      );
    }

    next();
  } catch (error) {
    return errorResponse(res, 'Erro ao verificar permissões de admin', 500);
  }
}

