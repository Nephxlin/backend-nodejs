import prisma from '../../config/database';

export class AdminDepositsService {
  /**
   * Listar todos os depósitos com filtros
   */
  async listDeposits(
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

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
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
      prisma.deposit.count({ where }),
    ]);

    return {
      deposits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obter estatísticas de depósitos
   */
  async getDepositStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalDeposits, pendingDeposits, todayDeposits] = await Promise.all([
      prisma.deposit.aggregate({
        where: { status: 1 },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.deposit.count({
        where: { status: 0 },
      }),
      prisma.deposit.aggregate({
        where: {
          status: 1,
          createdAt: { gte: today },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      totalValue: totalDeposits._sum.amount || 0,
      totalCount: totalDeposits._count,
      pendingCount: pendingDeposits,
      todayValue: todayDeposits._sum.amount || 0,
      todayCount: todayDeposits._count,
    };
  }

  /**
   * Aprovar depósito
   */
  async approveDeposit(depositId: number) {
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { user: { include: { wallet: true } } },
    });

    if (!deposit) {
      throw new Error('Depósito não encontrado');
    }

    if (deposit.status !== 0) {
      throw new Error('Depósito já foi processado');
    }

    const wallet = deposit.user.wallet;
    if (!wallet) {
      throw new Error('Carteira não encontrada');
    }

    // Atualizar depósito e adicionar saldo
    await prisma.$transaction([
      prisma.deposit.update({
        where: { id: depositId },
        data: { status: 1 },
      }),
      prisma.wallet.update({
        where: { userId: deposit.userId },
        data: {
          balance: {
            increment: deposit.amount,
          },
        },
      }),
      prisma.walletChange.create({
        data: {
          userId: deposit.userId,
          amount: deposit.amount,
          beforeBalance: wallet.balance,
          afterBalance: wallet.balance.toNumber() + deposit.amount.toNumber(),
          type: 'deposit',
          description: `Depósito aprovado #${depositId}`,
        },
      }),
    ]);

    return { success: true, message: 'Depósito aprovado com sucesso' };
  }

  /**
   * Rejeitar depósito
   */
  async rejectDeposit(depositId: number) {
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit) {
      throw new Error('Depósito não encontrado');
    }

    if (deposit.status !== 0) {
      throw new Error('Depósito já foi processado');
    }

    await prisma.deposit.update({
      where: { id: depositId },
      data: { status: 2 },
    });

    return { success: true, message: 'Depósito rejeitado' };
  }
}

