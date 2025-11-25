import { Response } from 'express';

export interface ApiResponse<T = any> {
  status: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Resposta de sucesso
 */
export function successResponse<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    status: true,
    data,
  };
  
  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
}

/**
 * Resposta de erro
 */
export function errorResponse(
  res: Response,
  error: string,
  statusCode: number = 400,
  data?: any
): Response {
  const response: ApiResponse = {
    status: false,
    error,
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}

/**
 * Resposta de erro de validação
 */
export function validationErrorResponse(
  res: Response,
  errors: Record<string, string[]>
): Response {
  return res.status(400).json({
    status: false,
    error: 'Erros de validação',
    data: errors,
  });
}

