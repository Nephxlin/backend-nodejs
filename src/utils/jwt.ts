import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JWTPayload {
  id: number;
  email: string;
  isAdmin?: boolean;
}

/**
 * Gera um token JWT
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
}

/**
 * Decodifica um token sem verificar (útil para debug)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}

