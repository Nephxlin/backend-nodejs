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
      const { amount, pix_key, pix_type } = req.body;

      if (!amount || !pix_key || !pix_type) {
        return errorResponse(res, 'Dados incompletos', 400);
      }

      const result = await withdrawalService.requestWithdrawal(
        userId,
        parseFloat(amount),
        pix_key,
        pix_type
      );

      return successResponse(res, result, result.message);
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
   * Aprovar saque (admin)
   */
  async approveWithdrawal(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const result = await withdrawalService.approveWithdrawal(parseInt(id));
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Recusar saque (admin)
   */
  async rejectWithdrawal(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const result = await withdrawalService.rejectWithdrawal(parseInt(id), reason);
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Listar saques pendentes (admin)
   */
  async listPendingWithdrawals(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await withdrawalService.listPendingWithdrawals(page, limit);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

