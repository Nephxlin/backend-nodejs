import prisma from '../config/database';
import { WalletService } from './wallet.service';
import logger from '../config/logger';

const walletService = new WalletService();

export class WithdrawalService {
  /**
   * Solicitar saque
   */
  async requestWithdrawal(
    userId: number,
    amount: number,
    pixKey: string,
    pixType: string
  ) {
    // Validar valor mínimo e máximo
    const setting = await this.getSetting();

    if (amount < Number(setting.minWithdrawal)) {
      throw new Error(
        `Valor mínimo de saque é ${setting.prefix}${setting.minWithdrawal}`
      );
    }

    if (amount > Number(setting.maxWithdrawal)) {
      throw new Error(
        `Valor máximo de saque é ${setting.prefix}${setting.maxWithdrawal}`
      );
    }

    // Verificar saldo
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Carteira não encontrada');
    }

    // Calcular saldo disponível para saque
    const availableBalance = Number(wallet.balance) + Number(wallet.balanceWithdrawal);

    if (availableBalance < amount) {
      throw new Error('Saldo insuficiente');
    }

    // Verificar rollover (proteção de rollover)
    if (setting.rolloverProtection) {
      const totalRollover =
        Number(wallet.balanceDepositRollover) + Number(wallet.balanceBonusRollover);

      if (totalRollover > 0) {
        throw new Error(
          'Você precisa completar o rollover antes de solicitar um saque'
        );
      }
    }

    // Criar saque
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        pixKey,
        pixType,
        currency: wallet.currency,
        symbol: wallet.symbol,
        status: 0, // Pendente
      },
    });

    // Subtrair saldo (bloqueado até aprovação)
    await walletService.subtractBalance(
      userId,
      amount,
      'balance',
      `Saque solicitado - ID: ${withdrawal.id}`
    );

    logger.info('Saque solicitado', {
      userId,
      amount,
      withdrawalId: withdrawal.id,
    });

    return {
      success: true,
      withdrawal,
      message: 'Saque solicitado com sucesso. Aguarde a aprovação.',
    };
  }

  /**
   * Aprovar saque (admin)
   */
  async approveWithdrawal(withdrawalId: number) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new Error('Saque não encontrado');
    }

    if (withdrawal.status !== 0) {
      throw new Error('Saque já foi processado');
    }

    // Atualizar status
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: 1 }, // Aprovado
    });

    logger.info('Saque aprovado', { withdrawalId, userId: withdrawal.userId });

    return {
      success: true,
      message: 'Saque aprovado com sucesso',
    };
  }

  /**
   * Recusar saque (admin)
   */
  async rejectWithdrawal(withdrawalId: number, reason?: string) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new Error('Saque não encontrado');
    }

    if (withdrawal.status !== 0) {
      throw new Error('Saque já foi processado');
    }

    // Atualizar status
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: 2 }, // Recusado
    });

    // Devolver saldo ao usuário
    await walletService.addBalance(
      withdrawal.userId,
      Number(withdrawal.amount),
      'balance',
      `Saque recusado - ID: ${withdrawal.id}${reason ? ` - Motivo: ${reason}` : ''}`
    );

    logger.info('Saque recusado', { withdrawalId, userId: withdrawal.userId, reason });

    return {
      success: true,
      message: 'Saque recusado e saldo devolvido ao usuário',
    };
  }

  /**
   * Listar saques do usuário
   */
  async listWithdrawals(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.withdrawal.count({
        where: { userId },
      }),
    ]);

    return {
      withdrawals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Listar todos os saques pendentes (admin)
   */
  async listPendingWithdrawals(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { status: 0 },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.withdrawal.count({
        where: { status: 0 },
      }),
    ]);

    return {
      withdrawals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obter configurações do sistema
   */
  private async getSetting() {
    let setting = await prisma.setting.findFirst();

    if (!setting) {
      setting = await prisma.setting.create({
        data: {},
      });
    }

    return setting;
  }
}

