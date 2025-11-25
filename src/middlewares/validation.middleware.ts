import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { validationErrorResponse } from '../utils/response';

/**
 * Middleware de validação usando Zod
 */
export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(err.message);
        });

        return validationErrorResponse(res, errors);
      }
      next(error);
    }
  };
}

