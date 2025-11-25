import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';

const authService = new AuthService();

export class AuthController {
  /**
   * Registrar novo usuário
   */
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, result, 'Usuário registrado com sucesso', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Login
   */
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const result = await authService.login(req.body);
      return successResponse(res, result, 'Login realizado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Logout
   */
  async logout(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const result = await authService.logout(userId);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Obter dados do usuário autenticado
   */
  async me(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const user = await authService.me(userId);
      return successResponse(res, user);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Verificar se está autenticado
   */
  async verify(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const result = await authService.verify(userId);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 401);
    }
  }

  /**
   * Refresh token
   */
  async refresh(req: Request, res: Response): Promise<Response> {
    try {
      // Gera um novo token para o usuário autenticado
      const userId = req.user!.id;
      const user = await authService.me(userId);
      
      // O middleware já validou o token, então podemos gerar um novo
      const { generateToken } = require('../utils/jwt');
      const token = generateToken({
        id: userId,
        email: req.user!.email,
      });

      return successResponse(res, {
        accessToken: token,
        tokenType: 'bearer',
        user,
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Solicitar reset de senha
   */
  async submitForgetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      const result = await authService.submitForgetPassword(email);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Resetar senha
   */
  async submitResetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email, token, password } = req.body;
      const result = await authService.submitResetPassword(email, token, password);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

