import { Request, Response } from 'express';
import { AdminDepositsService } from '../../services/admin/deposits.service';
import { successResponse, errorResponse } from '../../utils/response';

const depositsService = new AdminDepositsService();

export class AdminDepositsController {
  async listDeposits(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status
        ? parseInt(req.query.status as string)
        : undefined;
      const userId = req.query.userId
        ? parseInt(req.query.userId as string)
        : undefined;

      const result = await depositsService.listDeposits(
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

  async getDepositStats(req: Request, res: Response): Promise<Response> {
    try {
      const result = await depositsService.getDepositStats();
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async approveDeposit(req: Request, res: Response): Promise<Response> {
    try {
      const depositId = parseInt(req.params.id);
      const result = await depositsService.approveDeposit(depositId);
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async rejectDeposit(req: Request, res: Response): Promise<Response> {
    try {
      const depositId = parseInt(req.params.id);
      const result = await depositsService.rejectDeposit(depositId);
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

