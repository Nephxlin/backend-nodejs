import { Request, Response } from 'express';
import { AdminUsersService } from '../../services/admin/users.service';
import { successResponse, errorResponse } from '../../utils/response';

const usersService = new AdminUsersService();

export class AdminUsersController {
  async listUsers(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const result = await usersService.listUsers(page, limit, search);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getUserDetails(req: Request, res: Response): Promise<Response> {
    try {
      const userId = parseInt(req.params.id);
      const result = await usersService.getUserDetails(userId);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const userId = parseInt(req.params.id);
      const result = await usersService.updateUser(userId, req.body);
      return successResponse(res, result, 'Usuário atualizado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async toggleBanUser(req: Request, res: Response): Promise<Response> {
    try {
      const userId = parseInt(req.params.id);
      const result = await usersService.toggleBanUser(userId);
      return successResponse(
        res,
        result,
        result.banned ? 'Usuário banido' : 'Usuário desbanido'
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async adjustWallet(req: Request, res: Response): Promise<Response> {
    try {
      const userId = parseInt(req.params.id);
      const { amount, type, targetField, description } = req.body;

      const result = await usersService.adjustWallet(
        userId,
        amount,
        type,
        targetField || 'balance',
        description
      );
      return successResponse(res, result, 'Saldo ajustado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

