import { Request, Response } from 'express';
import { AdminDashboardService } from '../../services/admin/dashboard.service';
import { successResponse, errorResponse } from '../../utils/response';

const dashboardService = new AdminDashboardService();

export class AdminDashboardController {
  async getDashboardStats(_req: Request, res: Response): Promise<Response> {
    try {
      const result = await dashboardService.getDashboardStats();
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getRecentTransactions(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await dashboardService.getRecentTransactions(page, limit);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getRevenueChart(req: Request, res: Response): Promise<Response> {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const result = await dashboardService.getRevenueChart(days);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getCanceledTransactions(req: Request, res: Response): Promise<Response> {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const result = await dashboardService.getCanceledTransactions(days);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

