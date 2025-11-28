import { Request, Response } from 'express';
import { KwaiPixelsService } from '../../services/admin/kwai-pixels.service';
import { successResponse, errorResponse } from '../../utils/response';

const kwaiPixelsService = new KwaiPixelsService();

export class AdminKwaiPixelsController {
  /**
   * Listar todos os pixels Kwai
   */
  async listPixels(req: Request, res: Response): Promise<Response> {
    try {
      const result = await kwaiPixelsService.listPixels();
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Obter um pixel específico
   */
  async getPixel(req: Request, res: Response): Promise<Response> {
    try {
      const pixelId = parseInt(req.params.id);
      const result = await kwaiPixelsService.getPixel(pixelId);
      
      if (!result) {
        return errorResponse(res, 'Pixel não encontrado', 404);
      }
      
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Criar novo pixel Kwai
   */
  async createPixel(req: Request, res: Response): Promise<Response> {
    try {
      const result = await kwaiPixelsService.createPixel(req.body);
      return successResponse(res, result, 'Pixel Kwai criado com sucesso', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Atualizar pixel existente
   */
  async updatePixel(req: Request, res: Response): Promise<Response> {
    try {
      const pixelId = parseInt(req.params.id);
      const result = await kwaiPixelsService.updatePixel(pixelId, req.body);
      return successResponse(res, result, 'Pixel Kwai atualizado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Deletar pixel
   */
  async deletePixel(req: Request, res: Response): Promise<Response> {
    try {
      const pixelId = parseInt(req.params.id);
      await kwaiPixelsService.deletePixel(pixelId);
      return successResponse(res, null, 'Pixel Kwai deletado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Ativar/Desativar pixel
   */
  async togglePixelStatus(req: Request, res: Response): Promise<Response> {
    try {
      const pixelId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const result = await kwaiPixelsService.togglePixelStatus(pixelId, isActive);
      return successResponse(
        res, 
        result, 
        `Pixel ${isActive ? 'ativado' : 'desativado'} com sucesso`
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Listar pixels ativos (para o frontend usar)
   */
  async listActivePixels(req: Request, res: Response): Promise<Response> {
    try {
      const result = await kwaiPixelsService.listActivePixels();
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}


