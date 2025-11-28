import { Request, Response } from 'express';
import { WithdrawalService } from '../services/withdrawal.service';
import { successResponse, errorResponse } from '../utils/response';

const withdrawalService = new WithdrawalService();

export class WithdrawalController {
  /**
   * Solicitar saque
   */
  async requestWithdrawal(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const { amount, pixKey, pixType } = req.body;

      if (!amount || !pixKey || !pixType) {
        return errorResponse(res, 'Dados incompletos', 400);
      }

      // Validar tipo de chave PIX
      const validPixTypes = ['cpf', 'cnpj', 'email', 'phone', 'random'];
      if (!validPixTypes.includes(pixType)) {
        return errorResponse(res, 'Tipo de chave PIX inválido', 400);
      }

      const result = await withdrawalService.requestWithdrawal(
        userId,
        parseFloat(amount),
        pixKey,
        pixType
      );

      return successResponse(res, result, 'Saque solicitado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Listar saques do usuário
   */
  async listWithdrawals(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await withdrawalService.listWithdrawals(userId, page, limit);

      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Cancelar saque
   */
  async cancelWithdrawal(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const withdrawalId = parseInt(req.params.id);

      const result = await withdrawalService.cancelWithdrawal(withdrawalId, userId);

      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}
