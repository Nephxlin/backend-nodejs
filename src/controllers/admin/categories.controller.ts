import { Request, Response } from 'express';
import { AdminCategoriesService } from '../../services/admin/categories.service';
import { successResponse, errorResponse } from '../../utils/response';

const categoriesService = new AdminCategoriesService();

export class AdminCategoriesController {
  async listCategories(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await categoriesService.listCategories(page, limit);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getCategory(req: Request, res: Response): Promise<Response> {
    try {
      const categoryId = parseInt(req.params.id);
      const result = await categoriesService.getCategory(categoryId);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  async createCategory(req: Request, res: Response): Promise<Response> {
    try {
      const result = await categoriesService.createCategory(req.body);
      return successResponse(res, result, 'Categoria criada com sucesso', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateCategory(req: Request, res: Response): Promise<Response> {
    try {
      const categoryId = parseInt(req.params.id);
      const result = await categoriesService.updateCategory(categoryId, req.body);
      return successResponse(res, result, 'Categoria atualizada com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<Response> {
    try {
      const categoryId = parseInt(req.params.id);
      const result = await categoriesService.deleteCategory(categoryId);
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Vincular jogos a uma categoria
   */
  async addGamesToCategory(req: Request, res: Response): Promise<Response> {
    try {
      const categoryId = parseInt(req.params.id);
      const { gameIds } = req.body;

      if (!gameIds || !Array.isArray(gameIds)) {
        return errorResponse(res, 'gameIds deve ser um array', 400);
      }

      const result = await categoriesService.addGamesToCategory(categoryId, gameIds);
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Remover jogo de uma categoria
   */
  async removeGameFromCategory(req: Request, res: Response): Promise<Response> {
    try {
      const categoryId = parseInt(req.params.id);
      const gameId = parseInt(req.params.gameId);

      const result = await categoriesService.removeGameFromCategory(categoryId, gameId);
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Obter jogos de uma categoria
   */
  async getCategoryGames(req: Request, res: Response): Promise<Response> {
    try {
      const categoryId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await categoriesService.getCategoryGames(categoryId, page, limit);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Reordenar jogos de uma categoria
   */
  async reorderCategoryGames(req: Request, res: Response): Promise<Response> {
    try {
      const categoryId = parseInt(req.params.id);
      const { gameIds } = req.body; // Array de IDs na nova ordem

      if (!Array.isArray(gameIds) || gameIds.length === 0) {
        return errorResponse(res, 'gameIds deve ser um array não vazio', 400);
      }

      const result = await categoriesService.reorderCategoryGames(categoryId, gameIds);
      return successResponse(res, result, 'Ordem atualizada com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

