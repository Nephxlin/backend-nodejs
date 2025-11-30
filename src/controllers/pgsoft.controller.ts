import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

export class PGSoftController {
  /**
   * Callback para obter saldo do usuário
   * POST /api/pgsoft/user_balance
   */
  async getUserBalance(req: Request, res: Response): Promise<Response> {
    try {
      const { user_code } = req.body;

      logger.info(`[PGSOFT] user_balance - Request recebido:`, req.body);

      if (!user_code) {
        logger.warn(`[PGSOFT] user_balance - user_code não fornecido`);
        return res.json({
          status: 0,
          msg: 'ERROR',
          message: 'user_code is required'
        });
      }

      // Buscar usuário
      const user = await prisma.user.findFirst({
        where: { id: parseInt(user_code) },
        include: { wallet: true }
      });

      if (!user || !user.wallet) {
        logger.warn(`[PGSOFT] user_balance - Usuário ${user_code} não encontrado`);
        return res.json({
          status: 0,
          msg: 'ERROR',
          message: 'User not found'
        });
      }

      const totalBalance = Number(user.wallet.balance) + Number(user.wallet.balanceBonus);

      logger.info(`[PGSOFT] user_balance - Usuário: ${user_code}, Saldo: ${totalBalance}`);

      // Verificar se tem saldo suficiente (pelo menos maior que 0)
      if (totalBalance <= 0) {
        logger.warn(`[PGSOFT] user_balance - Saldo insuficiente para ${user_code}: ${totalBalance}`);
        return res.json({
          status: 0,
          msg: 'INSUFFICIENT_USER_FUNDS',
          user_balance: parseFloat(totalBalance.toFixed(2))
        });
      }

      const response = {
        status: 1,
        msg: 'SUCCESS',
        user_balance: parseFloat(totalBalance.toFixed(2))
      };

      logger.info(`[PGSOFT] user_balance - Resposta:`, response);

      return res.json(response);
    } catch (error: any) {
      logger.error('[PGSOFT] user_balance - Erro:', error);
      return res.json({
        status: 0,
        msg: 'ERROR',
        message: error.message
      });
    }
  }

  /**
   * Callback para processar apostas e ganhos
   * POST /api/pgsoft/game_callback
   */
  async gameCallback(req: Request, res: Response): Promise<Response> {
    try {
      const {
        user_code,
        transaction_id,
        bet_amount,
        win_amount,
        game_code
      } = req.body;

      logger.info(`PGSoft Callback: Transação do usuário ${user_code}`, {
        transaction_id,
        bet_amount,
        win_amount,
        game_code
      });

      if (!user_code || !transaction_id) {
        return res.json({
          status: 0,
          msg: 'ERROR',
          message: 'Invalid parameters'
        });
      }

      // Buscar usuário e wallet
      const user = await prisma.user.findFirst({
        where: { id: parseInt(user_code) },
        include: { wallet: true }
      });

      if (!user || !user.wallet) {
        return res.json({
          status: 0,
          msg: 'ERROR',
          message: 'User not found'
        });
      }

      const wallet = user.wallet;
      let newBalance = Number(wallet.balance);
      let newBalanceBonus = Number(wallet.balanceBonus);
      let newBalanceWithdrawal = Number(wallet.balanceWithdrawal);
      let newBonusRollover = Number(wallet.balanceBonusRollover);
      let newDepositRollover = Number(wallet.balanceDepositRollover);

      // Se tem aposta, debitar
      if (bet_amount && bet_amount > 0) {
        const totalBalance = newBalance + newBalanceBonus;
        if (totalBalance < bet_amount) {
          return res.json({
            status: 0,
            msg: 'ERROR',
            message: 'Insufficient balance'
          });
        }

        // Debitar primeiro do saldo bonus, depois do saldo normal
        let betFromBalance = 0;
        if (newBalanceBonus >= bet_amount) {
          newBalanceBonus -= bet_amount;
        } else {
          const remaining = bet_amount - newBalanceBonus;
          newBalanceBonus = 0;
          newBalance -= remaining;
          betFromBalance = remaining;
        }

        // Se apostou com saldo normal e não há rollover, também reduzir de balanceWithdrawal
        if (betFromBalance > 0 && newBonusRollover === 0 && newDepositRollover === 0) {
          newBalanceWithdrawal = Math.max(0, newBalanceWithdrawal - betFromBalance);
        }

        // Reduzir rollovers pendentes com a aposta
        const hadRollover = newBonusRollover > 0 || newDepositRollover > 0;
        
        // Registrar histórico de rollover de bônus
        if (newBonusRollover > 0) {
          const rolloverBefore = newBonusRollover;
          newBonusRollover = Math.max(0, newBonusRollover - bet_amount);
          
          await prisma.rolloverHistory.create({
            data: {
              userId: user.id,
              betAmount: bet_amount,
              rolloverBefore,
              rolloverAfter: newBonusRollover,
              rolloverType: 'bonus',
              gameCode: game_code,
            },
          }).catch(err => logger.error('Erro ao salvar histórico de rollover:', err));
        }
        
        // Registrar histórico de rollover de depósito
        if (newDepositRollover > 0) {
          const rolloverBefore = newDepositRollover;
          newDepositRollover = Math.max(0, newDepositRollover - bet_amount);
          
          await prisma.rolloverHistory.create({
            data: {
              userId: user.id,
              betAmount: bet_amount,
              rolloverBefore,
              rolloverAfter: newDepositRollover,
              rolloverType: 'deposit',
              gameCode: game_code,
            },
          }).catch(err => logger.error('Erro ao salvar histórico de rollover:', err));
        }

        // Se o rollover foi cumprido nesta aposta, transferir saldo para withdrawal
        const rolloverCompleted = hadRollover && (newBonusRollover === 0 && newDepositRollover === 0);
        if (rolloverCompleted) {
          // Transferir todo o saldo atual para balanceWithdrawal
          newBalanceWithdrawal = newBalance;
          logger.info(`🎉 Rollover cumprido para usuário ${user_code}! Saldo liberado para saque: ${newBalance}`);
        }
      }

      // Se tem ganho, creditar
      if (win_amount && win_amount > 0) {
        newBalance += win_amount;

        // Se não há rollover pendente, o ganho também pode ser sacado
        if (newBonusRollover === 0 && newDepositRollover === 0) {
          newBalanceWithdrawal += win_amount;
        }
      }

      // Atualizar wallet
      await prisma.wallet.update({
        where: { userId: user.id },
        data: {
          balance: newBalance,
          balanceBonus: newBalanceBonus,
          balanceWithdrawal: newBalanceWithdrawal,
          balanceBonusRollover: newBonusRollover,
          balanceDepositRollover: newDepositRollover,
          totalBet: { increment: bet_amount || 0 },
          totalWon: { increment: win_amount || 0 }
        }
      });

      const finalBalance = newBalance + newBalanceBonus;

      logger.info(`PGSoft Callback: Saldo atualizado para ${user_code}: ${finalBalance}`);

      return res.json({
        status: 1,
        msg: 'SUCCESS',
        user_balance: parseFloat(finalBalance.toFixed(2)),
        transaction_id
      });
    } catch (error: any) {
      logger.error('PGSoft Game Callback Error:', error);
      return res.json({
        status: 0,
        msg: 'ERROR',
        message: error.message
      });
    }
  }
}

export default new PGSoftController();
