import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';
import { successResponse, errorResponse } from '../utils/response';

const profileService = new ProfileService();

export class ProfileController {
  /**
   * Obter perfil do usuário
   */
  async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const profile = await profileService.getProfile(userId);

      return successResponse(res, profile);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Atualizar perfil
   */
  async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const { name, lastName, phone, avatar } = req.body;

      const profile = await profileService.updateProfile(userId, {
        name,
        lastName,
        phone,
        avatar,
      });

      return successResponse(res, profile, 'Perfil atualizado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Alterar senha
   */
  async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return errorResponse(res, 'Senhas são obrigatórias', 400);
      }

      if (newPassword.length < 6) {
        return errorResponse(res, 'Nova senha deve ter no mínimo 6 caracteres', 400);
      }

      const result = await profileService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Listar jogos favoritos
   */
  async getFavorites(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await profileService.getFavoriteGames(userId, page, limit);

      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Histórico de depósitos
   */
  async getDepositHistory(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await profileService.getDepositHistory(userId, page, limit);

      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Histórico de saques
   */
  async getWithdrawalHistory(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await profileService.getWithdrawalHistory(userId, page, limit);

      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Histórico de mudanças na carteira
   */
  async getWalletHistory(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await profileService.getWalletHistory(userId, page, limit);

      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Obter estatísticas de indicação
   */
  async getReferralStats(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const stats = await profileService.getReferralStats(userId);
      return successResponse(res, stats);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Histórico de rollover
   */
  async getRolloverHistory(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await profileService.getRolloverHistory(userId, page, limit);

      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Buscar informações do indicador por código
   */
  async getReferrerInfo(req: Request, res: Response): Promise<Response> {
    try {
      const { code } = req.params;

      if (!code) {
        return errorResponse(res, 'Código de indicação é obrigatório', 400);
      }

      const result = await profileService.getReferrerInfo(code);

      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

