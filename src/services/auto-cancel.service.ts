import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Serviço de auto-cancelamento de transações pendentes
 * Cancela automaticamente depósitos e saques que estão pendentes por mais de 5 minutos
 */
export class AutoCancelService {
  private timeoutMinutes = 5;

  /**
   * Cancela depósitos pendentes com mais de 5 minutos
   */
  async cancelExpiredDeposits(): Promise<number> {
    try {
      const timeoutDate = new Date();
      timeoutDate.setMinutes(timeoutDate.getMinutes() - this.timeoutMinutes);

      // Buscar depósitos pendentes com mais de 5 minutos
      const expiredDeposits = await prisma.deposit.findMany({
        where: {
          status: 0, // Pendente
          createdAt: {
            lt: timeoutDate, // Criados antes de 5 minutos atrás
          },
        },
        select: {
          id: true,
          userId: true,
          amount: true,
          createdAt: true,
        },
      });

      if (expiredDeposits.length === 0) {
        return 0;
      }

      // Atualizar status para 2 (Não pago/Cancelado)
      const result = await prisma.deposit.updateMany({
        where: {
          id: {
            in: expiredDeposits.map((d) => d.id),
          },
        },
        data: {
          status: 2, // Não pago
        },
      });

      logger.info(
        `[AUTO-CANCEL] ${result.count} depósitos cancelados automaticamente (timeout de ${this.timeoutMinutes} minutos)`
      );

      // Log individual de cada depósito cancelado
      expiredDeposits.forEach((deposit) => {
        const minutesAgo = Math.floor(
          (Date.now() - deposit.createdAt.getTime()) / 60000
        );
        logger.info(
          `[AUTO-CANCEL] Depósito #${deposit.id} cancelado - User: ${deposit.userId}, Valor: ${deposit.amount}, Pendente há: ${minutesAgo} minutos`
        );
      });

      return result.count;
    } catch (error: any) {
      logger.error('[AUTO-CANCEL] Erro ao cancelar depósitos:', error);
      return 0;
    }
  }

  /**
   * Cancela saques pendentes com mais de 5 minutos
   */
  async cancelExpiredWithdrawals(): Promise<number> {
    try {
      const timeoutDate = new Date();
      timeoutDate.setMinutes(timeoutDate.getMinutes() - this.timeoutMinutes);

      // Buscar saques pendentes com mais de 5 minutos
      const expiredWithdrawals = await prisma.withdrawal.findMany({
        where: {
          status: 0, // Pendente
          createdAt: {
            lt: timeoutDate, // Criados antes de 5 minutos atrás
          },
        },
        select: {
          id: true,
          userId: true,
          amount: true,
          createdAt: true,
        },
      });

      if (expiredWithdrawals.length === 0) {
        return 0;
      }

      // Atualizar status para 2 (Não pago/Cancelado)
      const result = await prisma.withdrawal.updateMany({
        where: {
          id: {
            in: expiredWithdrawals.map((w) => w.id),
          },
        },
        data: {
          status: 2, // Não pago
        },
      });

      logger.info(
        `[AUTO-CANCEL] ${result.count} saques cancelados automaticamente (timeout de ${this.timeoutMinutes} minutos)`
      );

      // Log individual de cada saque cancelado
      expiredWithdrawals.forEach((withdrawal) => {
        const minutesAgo = Math.floor(
          (Date.now() - withdrawal.createdAt.getTime()) / 60000
        );
        logger.info(
          `[AUTO-CANCEL] Saque #${withdrawal.id} cancelado - User: ${withdrawal.userId}, Valor: ${withdrawal.amount}, Pendente há: ${minutesAgo} minutos`
        );
      });

      return result.count;
    } catch (error: any) {
      logger.error('[AUTO-CANCEL] Erro ao cancelar saques:', error);
      return 0;
    }
  }

  /**
   * Executa o cancelamento automático de todas as transações expiradas
   */
  async run(): Promise<void> {
    logger.info('[AUTO-CANCEL] Iniciando verificação de transações expiradas...');

    const [depositsCanceled, withdrawalsCanceled] = await Promise.all([
      this.cancelExpiredDeposits(),
      this.cancelExpiredWithdrawals(),
    ]);

    if (depositsCanceled > 0 || withdrawalsCanceled > 0) {
      logger.info(
        `[AUTO-CANCEL] Total cancelado: ${depositsCanceled} depósitos, ${withdrawalsCanceled} saques`
      );
    } else {
      logger.debug('[AUTO-CANCEL] Nenhuma transação expirada encontrada');
    }
  }

  /**
   * Configura o timeout em minutos (padrão: 5)
   */
  setTimeoutMinutes(minutes: number): void {
    this.timeoutMinutes = minutes;
    logger.info(`[AUTO-CANCEL] Timeout configurado para ${minutes} minutos`);
  }

  /**
   * Obtém o timeout atual em minutos
   */
  getTimeoutMinutes(): number {
    return this.timeoutMinutes;
  }
}

export default new AutoCancelService();

