import prisma from '../../config/database';

export class AdminWithdrawalsService {
  /**
   * Listar todos os saques com filtros
   */
  async listWithdrawals(
    page: number = 1,
    limit: number = 20,
    status?: number,
    userId?: number
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== undefined) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              lastName: true,
              email: true,
              cpf: true,
            },
          },
        },
      }),
      prisma.withdrawal.count({ where }),
    ]);

    return {
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obter estatísticas de saques
   */
  async getWithdrawalStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalWithdrawals, pendingWithdrawals, todayWithdrawals] =
      await Promise.all([
        prisma.withdrawal.aggregate({
          where: { status: 1 },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.withdrawal.count({
          where: { status: 0 },
        }),
        prisma.withdrawal.aggregate({
          where: {
            status: 1,
            createdAt: { gte: today },
          },
          _sum: { amount: true },
          _count: true,
        }),
      ]);

    return {
      totalValue: totalWithdrawals._sum.amount || 0,
      totalCount: totalWithdrawals._count,
      pendingCount: pendingWithdrawals,
      todayValue: todayWithdrawals._sum.amount || 0,
      todayCount: todayWithdrawals._count,
    };
  }

  /**
   * Aprovar saque
   */
  async approveWithdrawal(withdrawalId: number, proof?: string) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: { include: { wallet: true } } },
    });

    if (!withdrawal) {
      throw new Error('Saque não encontrado');
    }

    if (withdrawal.status !== 0) {
      throw new Error('Saque já foi processado');
    }

    // Atualizar saque
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 1,
        proof: proof || withdrawal.proof,
      },
    });

    return { success: true, message: 'Saque aprovado com sucesso' };
  }

  /**
   * Rejeitar saque
   */
  async rejectWithdrawal(withdrawalId: number) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: { include: { wallet: true } } },
    });

    if (!withdrawal) {
      throw new Error('Saque não encontrado');
    }

    if (withdrawal.status !== 0) {
      throw new Error('Saque já foi processado');
    }

    const wallet = withdrawal.user.wallet;
    if (!wallet) {
      throw new Error('Carteira não encontrada');
    }

    // Rejeitar saque e devolver saldo
    await prisma.$transaction([
      prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: 2 },
      }),
      prisma.wallet.update({
        where: { userId: withdrawal.userId },
        data: {
          balance: {
            increment: withdrawal.amount,
          },
          balanceWithdrawal: {
            increment: withdrawal.amount,
          },
        },
      }),
      prisma.walletChange.create({
        data: {
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          beforeBalance: wallet.balance,
          afterBalance: wallet.balance.toNumber() + withdrawal.amount.toNumber(),
          type: 'withdrawal_rejected',
          description: `Saque rejeitado #${withdrawalId} - saldo devolvido`,
        },
      }),
    ]);

    return { success: true, message: 'Saque rejeitado e saldo devolvido' };
  }
}

