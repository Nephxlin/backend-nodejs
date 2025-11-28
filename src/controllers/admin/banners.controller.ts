import { Request, Response } from 'express';
import { AdminBannersService } from '../../services/admin/banners.service';
import { UploadService } from '../../services/upload.service';
import { successResponse, errorResponse } from '../../utils/response';

const bannersService = new AdminBannersService();
const uploadService = new UploadService();

export class AdminBannersController {
  async listBanners(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await bannersService.listBanners(page, limit);
      
      // Formatar resposta para o padrão esperado pelo frontend
      const formattedResult = {
        items: result.banners,
        page: result.pagination.page,
        perPage: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      };

      return successResponse(res, formattedResult);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getBanner(req: Request, res: Response): Promise<Response> {
    try {
      const bannerId = parseInt(req.params.id);
      const result = await bannersService.getBanner(bannerId);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  async createBanner(req: Request, res: Response): Promise<Response> {
    try {
      const result = await bannersService.createBanner(req.body);
      return successResponse(res, result, 'Banner criado com sucesso', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateBanner(req: Request, res: Response): Promise<Response> {
    try {
      const bannerId = parseInt(req.params.id);
      const result = await bannersService.updateBanner(bannerId, req.body);
      return successResponse(res, result, 'Banner atualizado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteBanner(req: Request, res: Response): Promise<Response> {
    try {
      const bannerId = parseInt(req.params.id);
      const result = await bannersService.deleteBanner(bannerId);
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async toggleBannerStatus(req: Request, res: Response): Promise<Response> {
    try {
      const bannerId = parseInt(req.params.id);
      const result = await bannersService.toggleBannerStatus(bannerId);
      return successResponse(
        res,
        result,
        `Banner ${result.isActive ? 'ativado' : 'desativado'}`
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Upload de imagem para banner
   */
  async uploadImage(req: Request, res: Response): Promise<Response> {
    try {
      const { image } = req.body;

      if (!image) {
        return errorResponse(res, 'Imagem não fornecida', 400);
      }

      const imagePath = await uploadService.uploadBase64Image(image, 'banners');

      return successResponse(
        res,
        { path: imagePath },
        'Imagem enviada com sucesso'
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

