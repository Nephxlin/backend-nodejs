import { Request, Response } from 'express';
import { AdminWithdrawalsService } from '../../services/admin/withdrawals.service';
import { successResponse, errorResponse } from '../../utils/response';

const withdrawalsService = new AdminWithdrawalsService();

export class AdminWithdrawalsController {
  async listWithdrawals(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status
        ? parseInt(req.query.status as string)
        : undefined;
      const userId = req.query.userId
        ? parseInt(req.query.userId as string)
        : undefined;

      const result = await withdrawalsService.listWithdrawals(
        page,
        limit,
        status,
        userId
      );
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getWithdrawalStats(req: Request, res: Response): Promise<Response> {
    try {
      const result = await withdrawalsService.getWithdrawalStats();
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async approveWithdrawal(req: Request, res: Response): Promise<Response> {
    try {
      const withdrawalId = parseInt(req.params.id);
      const { proof } = req.body;

      const result = await withdrawalsService.approveWithdrawal(
        withdrawalId,
        proof
      );
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async rejectWithdrawal(req: Request, res: Response): Promise<Response> {
    try {
      const withdrawalId = parseInt(req.params.id);
      const result = await withdrawalsService.rejectWithdrawal(withdrawalId);
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

