import { Request, Response } from 'express';
import { WalletService } from '../services/wallet.service';
import { successResponse, errorResponse } from '../utils/response';

const walletService = new WalletService();

export class WalletController {
  /**
   * Obter carteira do usuário
   */
  async getWallet(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const wallet = await walletService.getWallet(userId);
      return successResponse(res, { wallet });
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Obter histórico de transações
   */
  async getTransactions(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await walletService.getTransactions(userId, page, limit);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Obter histórico de mudanças
   */
  async getWalletChanges(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await walletService.getWalletChanges(userId, page, limit);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Toggle ocultar saldo
   */
  async toggleHideBalance(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const wallet = await walletService.toggleHideBalance(userId);
      return successResponse(res, { wallet }, 'Configuração atualizada');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

