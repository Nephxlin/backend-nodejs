import { Request, Response } from 'express';
import { AdminSettingsService } from '../../services/admin/settings.service';
import { successResponse, errorResponse } from '../../utils/response';

const settingsService = new AdminSettingsService();

export class AdminSettingsController {
  async getSettings(_req: Request, res: Response): Promise<Response> {
    try {
      const result = await settingsService.getSettings();
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateSettings(req: Request, res: Response): Promise<Response> {
    try {
      const result = await settingsService.updateSettings(req.body);
      return successResponse(res, result, 'Configurações atualizadas com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getGamesKeys(_req: Request, res: Response): Promise<Response> {
    try {
      const result = await settingsService.getGamesKeys();
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateGamesKeys(req: Request, res: Response): Promise<Response> {
    try {
      const result = await settingsService.updateGamesKeys(req.body);
      return successResponse(res, result, 'Chaves de jogos atualizadas com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async listGateways(_req: Request, res: Response): Promise<Response> {
    try {
      const result = await settingsService.listGateways();
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async createGateway(req: Request, res: Response): Promise<Response> {
    try {
      const result = await settingsService.createGateway(req.body);
      return successResponse(res, result, 'Gateway criado com sucesso', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateGateway(req: Request, res: Response): Promise<Response> {
    try {
      const gatewayId = parseInt(req.params.id);
      const result = await settingsService.updateGateway(gatewayId, req.body);
      return successResponse(res, result, 'Gateway atualizado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteGateway(req: Request, res: Response): Promise<Response> {
    try {
      const gatewayId = parseInt(req.params.id);
      const result = await settingsService.deleteGateway(gatewayId);
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

