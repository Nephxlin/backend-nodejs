import { Request, Response } from 'express';
import { AdminProvidersService } from '../../services/admin/providers.service';
import { successResponse, errorResponse } from '../../utils/response';

const providersService = new AdminProvidersService();

export class AdminProvidersController {
  async listProviders(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await providersService.listProviders(page, limit);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getProvider(req: Request, res: Response): Promise<Response> {
    try {
      const providerId = parseInt(req.params.id);
      const result = await providersService.getProvider(providerId);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  async createProvider(req: Request, res: Response): Promise<Response> {
    try {
      const result = await providersService.createProvider(req.body);
      return successResponse(res, result, 'Provedor criado com sucesso', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateProvider(req: Request, res: Response): Promise<Response> {
    try {
      const providerId = parseInt(req.params.id);
      const result = await providersService.updateProvider(providerId, req.body);
      return successResponse(res, result, 'Provedor atualizado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteProvider(req: Request, res: Response): Promise<Response> {
    try {
      const providerId = parseInt(req.params.id);
      const result = await providersService.deleteProvider(providerId);
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

