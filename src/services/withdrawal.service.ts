import prisma from '../config/database';
import logger from '../config/logger';

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

    // Buscar carteira
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Carteira não encontrada');
    }

    // Verificar se há rollover pendente
    const bonusRollover = Number(wallet.balanceBonusRollover);
    const depositRollover = Number(wallet.balanceDepositRollover);
    
    if (bonusRollover > 0 || depositRollover > 0) {
      const totalRollover = bonusRollover + depositRollover;
      throw new Error(
        `Você precisa cumprir o rollover antes de sacar. Faltam ${setting.prefix}${totalRollover.toFixed(2)} em apostas.`
      );
    }

    // Verificar saldo disponível para saque
    const availableBalance = Number(wallet.balanceWithdrawal);

    if (availableBalance < amount) {
      throw new Error(
        `Saldo insuficiente para saque. Disponível: ${setting.prefix}${availableBalance.toFixed(2)}`
      );
    }

    // Verificar se usuário está banido
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.banned) {
      throw new Error('Sua conta está suspensa. Entre em contato com o suporte.');
    }

    // Criar saque
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        pixKey,
        pixType,
        status: 0, // Pendente
        currency: wallet.currency,
        symbol: wallet.symbol,
      },
    });

    // Deduzir do saldo de saque E do saldo para jogar
    await prisma.wallet.update({
      where: { userId },
      data: {
        balanceWithdrawal: {
          decrement: amount,
        },
        balance: {
          decrement: amount,
        },
      },
    });

    // Registrar mudança na carteira
    await prisma.walletChange.create({
      data: {
        userId,
        amount: -amount,
        beforeBalance: availableBalance,
        afterBalance: availableBalance - amount,
        type: 'withdrawal_request',
        description: `Solicitação de saque - ${pixType}: ${pixKey}`,
      },
    });

    logger.info(
      `Saque solicitado: Usuário ${userId}, Valor: ${amount}, PIX: ${pixType}`
    );

    return {
      id: withdrawal.id,
      amount: Number(withdrawal.amount),
      pixKey: withdrawal.pixKey,
      pixType: withdrawal.pixType,
      status: withdrawal.status,
      statusText: 'Pendente',
      createdAt: withdrawal.createdAt,
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
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.withdrawal.count({
        where: { userId },
      }),
    ]);

    return {
      withdrawals: withdrawals.map((wd) => ({
        id: wd.id,
        amount: Number(wd.amount),
        status: wd.status,
        statusText: this.getStatusText(wd.status),
        pixKey: wd.pixKey,
        pixType: wd.pixType,
        currency: wd.currency,
        symbol: wd.symbol,
        createdAt: wd.createdAt,
        updatedAt: wd.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Cancelar saque (se ainda estiver pendente)
   */
  async cancelWithdrawal(withdrawalId: number, userId: number) {
    const withdrawal = await prisma.withdrawal.findFirst({
      where: {
        id: withdrawalId,
        userId,
      },
    });

    if (!withdrawal) {
      throw new Error('Saque não encontrado');
    }

    if (withdrawal.status !== 0) {
      throw new Error('Apenas saques pendentes podem ser cancelados');
    }

    // Atualizar status para cancelado
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 2, // Cancelado
      },
    });

    // Devolver valor para carteira
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (wallet) {
      const currentBalance = Number(wallet.balanceWithdrawal);
      const amount = Number(withdrawal.amount);

      await prisma.wallet.update({
        where: { userId },
        data: {
          balanceWithdrawal: {
            increment: amount,
          },
          balance: {
            increment: amount,
          },
        },
      });

      // Registrar mudança
      await prisma.walletChange.create({
        data: {
          userId,
          amount,
          beforeBalance: currentBalance,
          afterBalance: currentBalance + amount,
          type: 'withdrawal_cancelled',
          description: `Saque cancelado - ID: ${withdrawalId}`,
        },
      });
    }

    logger.info(`Saque cancelado: ID ${withdrawalId}, Usuário ${userId}`);

    return {
      success: true,
      message: 'Saque cancelado com sucesso',
    };
  }

  /**
   * Obter configurações
   */
  private async getSetting() {
    const setting = await prisma.setting.findFirst();
    if (!setting) {
      throw new Error('Configurações não encontradas');
    }
    return setting;
  }

  /**
   * Obter texto do status
   */
  private getStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'Pendente',
      1: 'Aprovado',
      2: 'Cancelado',
      3: 'Rejeitado',
    };
    return statusMap[status] || 'Desconhecido';
  }
}
