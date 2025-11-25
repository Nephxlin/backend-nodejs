import { Request, Response } from 'express';
import { DepositService } from '../services/deposit.service';
import { successResponse, errorResponse } from '../utils/response';

const depositService = new DepositService();

export class DepositController {
  /**
   * Criar depósito via PIX
   */
  async createDeposit(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const { amount, cpf, accept_bonus, gateway } = req.body;

      // Por enquanto só suportamos Asaas
      if (gateway && gateway !== 'asaas') {
        return errorResponse(res, 'Gateway não suportado', 400);
      }

      const result = await depositService.createPixDeposit(
        userId,
        parseFloat(amount),
        cpf,
        accept_bonus || false
      );

      return successResponse(res, result, 'Depósito criado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Verificar status do depósito
   */
  async verifyDeposit(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const { idTransaction } = req.body;

      if (!idTransaction) {
        return errorResponse(res, 'ID da transação é obrigatório', 400);
      }

      const result = await depositService.verifyDeposit(userId, idTransaction);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Listar depósitos
   */
  async listDeposits(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await depositService.listDeposits(userId, page, limit);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Webhook Asaas (receber notificações de pagamento)
   */
  async webhookAsaas(req: Request, res: Response): Promise<Response> {
    try {
      const payload = req.body;

      // Processar webhook
      if (
        payload.event === 'PAYMENT_RECEIVED' ||
        payload.event === 'PAYMENT_CONFIRMED'
      ) {
        const externalReference = payload.payment?.externalReference;

        if (externalReference) {
          await depositService.finalizePayment(externalReference);
        }
      }

      return res.status(200).send('OK');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
}

