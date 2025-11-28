import { Request, Response } from 'express';
import { GamesService } from '../services/games.service';
import { successResponse, errorResponse } from '../utils/response';

const gamesService = new GamesService();

export class GamesController {
  /**
   * Listar jogos
   */
  async listGames(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId
        ? parseInt(req.query.categoryId as string)
        : undefined;
      const providerId = req.query.providerId
        ? parseInt(req.query.providerId as string)
        : undefined;

      const result = await gamesService.listGames(
        page,
        limit,
        search,
        categoryId,
        providerId
      );

      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Obter detalhes do jogo
   */
  async getGame(req: Request, res: Response): Promise<Response> {
    try {
      const gameId = parseInt(req.params.id);
      const userId = req.user?.id;

      const game = await gamesService.getGameById(gameId);

      // Se usuário estiver autenticado, verificar se favoritou
      let isFavorite = false;
      if (userId) {
        isFavorite = await gamesService.checkFavorite(gameId, userId);
      }

      return successResponse(res, {
        ...game,
        isFavorite,
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Lançar jogo
   */
  async launchGame(req: Request, res: Response): Promise<Response> {
    try {
      const gameId = parseInt(req.params.id);
      const userId = req.user!.id;

      const result = await gamesService.launchGame(gameId, userId);

      return successResponse(res, result, 'Jogo iniciado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Favoritar/desfavoritar jogo
   */
  async toggleFavorite(req: Request, res: Response): Promise<Response> {
    try {
      const gameId = parseInt(req.params.id);
      const userId = req.user!.id;

      const result = await gamesService.toggleFavorite(gameId, userId);

      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Curtir jogo
   */
  async likeGame(req: Request, res: Response): Promise<Response> {
    try {
      const gameId = parseInt(req.params.id);
      const userId = req.user!.id;

      const result = await gamesService.likeGame(gameId, userId);

      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Listar jogos em destaque
   */
  async getFeaturedGames(req: Request, res: Response): Promise<Response> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const games = await gamesService.getFeaturedGames(limit);

      return successResponse(res, games);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

