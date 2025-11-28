import { Request, Response } from 'express';
import { AdminGamesService } from '../../services/admin/games.service';
import { PGSoftService } from '../../services/admin/pgsoft.service';
import { UploadService } from '../../services/upload.service';
import { successResponse, errorResponse } from '../../utils/response';

const gamesService = new AdminGamesService();
const pgsoftService = new PGSoftService();
const uploadService = new UploadService();

export class AdminGamesController {
  async listGames(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const providerId = req.query.providerId
        ? parseInt(req.query.providerId as string)
        : undefined;
      const status = req.query.status
        ? parseInt(req.query.status as string)
        : undefined;

      const result = await gamesService.listGames(
        page,
        limit,
        search,
        providerId,
        status
      );
      
      // Formatar resposta para o padrão esperado pelo frontend
      const formattedResult = {
        items: result.games,
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

  async getGame(req: Request, res: Response): Promise<Response> {
    try {
      const gameId = parseInt(req.params.id);
      const result = await gamesService.getGame(gameId);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  async createGame(req: Request, res: Response): Promise<Response> {
    try {
      const result = await gamesService.createGame(req.body);
      return successResponse(res, result, 'Jogo criado com sucesso', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateGame(req: Request, res: Response): Promise<Response> {
    try {
      const gameId = parseInt(req.params.id);
      const result = await gamesService.updateGame(gameId, req.body);
      return successResponse(res, result, 'Jogo atualizado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteGame(req: Request, res: Response): Promise<Response> {
    try {
      const gameId = parseInt(req.params.id);
      const result = await gamesService.deleteGame(gameId);
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async toggleGameStatus(req: Request, res: Response): Promise<Response> {
    try {
      const gameId = parseInt(req.params.id);
      const result = await gamesService.toggleGameStatus(gameId);
      return successResponse(
        res,
        result,
        `Jogo ${result.status === 1 ? 'ativado' : 'desativado'}`
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Sincronizar jogos PGSoft da API Node
   */
  async syncPGSoftGames(req: Request, res: Response): Promise<Response> {
    try {
      // Buscar URL da API PGSoft das configurações
      const pgsoftApiUrl = await pgsoftService.getPGSoftApiUrl();

      if (!pgsoftApiUrl) {
        return errorResponse(
          res,
          'URL da API PGSoft não configurada. Configure em Configurações > Chaves de Jogos',
          400
        );
      }

      // Sincronizar jogos
      const result = await pgsoftService.syncGames(pgsoftApiUrl);

      return successResponse(
        res,
        result,
        `Sincronização concluída: ${result.created} jogos criados, ${result.existing} já existentes`
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Listar jogos disponíveis na API PGSoft Node
   */
  async listAvailablePGSoftGames(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const games = pgsoftService.getAvailableGames();
      return successResponse(res, games);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Upload de imagem de capa para jogo
   */
  async uploadGameCover(req: Request, res: Response): Promise<Response> {
    try {
      const { image } = req.body;

      if (!image) {
        return errorResponse(res, 'Imagem não fornecida', 400);
      }

      const imagePath = await uploadService.uploadBase64Image(image, 'games');

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

