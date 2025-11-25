import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';

export class WalletService {
  /**
   * Obter carteira do usuário
   */
  async getWallet(userId: number) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Carteira não encontrada');
    }

    return this.formatWallet(wallet);
  }

  /**
   * Obter histórico de transações
   */
  async getTransactions(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: { userId },
      }),
    ]);

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obter histórico de mudanças na carteira
   */
  async getWalletChanges(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [changes, total] = await Promise.all([
      prisma.walletChange.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.walletChange.count({
        where: { userId },
      }),
    ]);

    return {
      changes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Adicionar saldo à carteira
   */
  async addBalance(
    userId: number,
    amount: number,
    type: 'balance' | 'balance_bonus' | 'balance_withdrawal' = 'balance',
    description?: string
  ) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Carteira não encontrada');
    }

    // Mapear tipo de saldo
    const balanceField = this.getBalanceField(type);

    // Atualizar saldo
    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: {
        [balanceField]: {
          increment: amount,
        },
      },
    });

    // Registrar mudança
    await this.recordWalletChange(
      userId,
      amount,
      Number(wallet[balanceField as keyof typeof wallet]),
      Number(updatedWallet[balanceField as keyof typeof updatedWallet]),
      type,
      description
    );

    return this.formatWallet(updatedWallet);
  }

  /**
   * Subtrair saldo da carteira
   */
  async subtractBalance(
    userId: number,
    amount: number,
    type: 'balance' | 'balance_bonus' | 'balance_withdrawal' = 'balance',
    description?: string
  ) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Carteira não encontrada');
    }

    const balanceField = this.getBalanceField(type);
    const currentBalance = Number(wallet[balanceField as keyof typeof wallet]);

    if (currentBalance < amount) {
      throw new Error('Saldo insuficiente');
    }

    // Atualizar saldo
    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: {
        [balanceField]: {
          decrement: amount,
        },
      },
    });

    // Registrar mudança
    await this.recordWalletChange(
      userId,
      -amount,
      currentBalance,
      Number(updatedWallet[balanceField as keyof typeof updatedWallet]),
      type,
      description
    );

    return this.formatWallet(updatedWallet);
  }

  /**
   * Transferir saldo entre tipos
   */
  async transferBalance(
    userId: number,
    amount: number,
    from: 'balance' | 'balance_bonus' | 'balance_withdrawal',
    to: 'balance' | 'balance_bonus' | 'balance_withdrawal'
  ) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Carteira não encontrada');
    }

    const fromField = this.getBalanceField(from);
    const toField = this.getBalanceField(to);

    const currentFromBalance = Number(wallet[fromField as keyof typeof wallet]);

    if (currentFromBalance < amount) {
      throw new Error('Saldo insuficiente');
    }

    // Transferir saldo
    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: {
        [fromField]: {
          decrement: amount,
        },
        [toField]: {
          increment: amount,
        },
      },
    });

    return this.formatWallet(updatedWallet);
  }

  /**
   * Atualizar estatísticas de apostas
   */
  async updateBetStats(
    userId: number,
    betAmount: number,
    wonAmount: number,
    isWin: boolean
  ) {
    const updates: any = {
      totalBet: {
        increment: betAmount,
      },
    };

    if (isWin) {
      updates.totalWon = {
        increment: wonAmount,
      };
      updates.lastWon = wonAmount;
    } else {
      updates.totalLose = {
        increment: betAmount,
      };
      updates.lastLose = betAmount;
    }

    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: updates,
    });

    return this.formatWallet(updatedWallet);
  }

  /**
   * Toggle ocultar saldo
   */
  async toggleHideBalance(userId: number) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Carteira não encontrada');
    }

    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: {
        hideBalance: !wallet.hideBalance,
      },
    });

    return this.formatWallet(updatedWallet);
  }

  /**
   * Obter saldo total
   */
  async getTotalBalance(userId: number): Promise<number> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return 0;
    }

    return (
      Number(wallet.balance) +
      Number(wallet.balanceBonus) +
      Number(wallet.balanceWithdrawal)
    );
  }

  /**
   * Registrar mudança na carteira
   */
  private async recordWalletChange(
    userId: number,
    amount: number,
    beforeBalance: number,
    afterBalance: number,
    type: string,
    description?: string
  ) {
    await prisma.walletChange.create({
      data: {
        userId,
        amount,
        beforeBalance,
        afterBalance,
        type,
        description,
      },
    });
  }

  /**
   * Mapear tipo para campo do banco
   */
  private getBalanceField(type: string): string {
    const fieldMap: Record<string, string> = {
      balance: 'balance',
      balance_bonus: 'balanceBonus',
      balance_withdrawal: 'balanceWithdrawal',
      balance_deposit_rollover: 'balanceDepositRollover',
      balance_bonus_rollover: 'balanceBonusRollover',
    };

    return fieldMap[type] || 'balance';
  }

  /**
   * Formatar carteira com campos calculados
   */
  private formatWallet(wallet: any) {
    return {
      ...wallet,
      totalBalance:
        Number(wallet.balance) +
        Number(wallet.balanceBonus) +
        Number(wallet.balanceWithdrawal),
      totalBalanceWithoutBonus:
        Number(wallet.balance) + Number(wallet.balanceWithdrawal),
    };
  }
}

