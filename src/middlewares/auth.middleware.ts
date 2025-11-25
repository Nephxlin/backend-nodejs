import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { errorResponse } from '../utils/response';
import prisma from '../config/database';

// Extende o Request do Express para incluir o user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

/**
 * Middleware de autenticação JWT
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return errorResponse(res, 'Token não fornecido', 401);
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return errorResponse(res, 'Formato de token inválido', 401);
    }

    const token = parts[1];

    // Verifica o token
    const decoded = verifyToken(token);

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        banned: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'Usuário não encontrado', 401);
    }

    if (user.banned) {
      return errorResponse(res, 'Usuário banido', 403);
    }

    // Adiciona o usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error: any) {
    return errorResponse(res, error.message || 'Token inválido', 401);
  }
}

/**
 * Middleware de autenticação opcional (não retorna erro se não houver token)
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');

      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const decoded = verifyToken(token);

        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
          },
        });

        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
          };
        }
      }
    }
  } catch (error) {
    // Ignora erros no modo opcional
  }

  next();
}

