import { Request, Response } from 'express';
import { AdminVipsService } from '../../services/admin/vips.service';
import { successResponse, errorResponse } from '../../utils/response';

const vipsService = new AdminVipsService();

export class AdminVipsController {
  async listVips(req: Request, res: Response): Promise<Response> {
    try {
      const result = await vipsService.listVips();
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getVip(req: Request, res: Response): Promise<Response> {
    try {
      const vipId = parseInt(req.params.id);
      const result = await vipsService.getVip(vipId);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  async createVip(req: Request, res: Response): Promise<Response> {
    try {
      const result = await vipsService.createVip(req.body);
      return successResponse(res, result, 'Nível VIP criado com sucesso', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateVip(req: Request, res: Response): Promise<Response> {
    try {
      const vipId = parseInt(req.params.id);
      const result = await vipsService.updateVip(vipId, req.body);
      return successResponse(res, result, 'Nível VIP atualizado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteVip(req: Request, res: Response): Promise<Response> {
    try {
      const vipId = parseInt(req.params.id);
      const result = await vipsService.deleteVip(vipId);
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

