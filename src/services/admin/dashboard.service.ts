import prisma from '../../config/database';

export class AdminDashboardService {
  /**
   * Obter estatísticas gerais do dashboard
   */
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsersToday,
      totalDepositsValue,
      totalWithdrawalsValue,
      pendingDeposits,
      pendingWithdrawals,
      depositsToday,
      withdrawalsToday,
      systemWallet,
    ] = await Promise.all([
      // Total de usuários
      prisma.user.count(),

      // Usuários ativos hoje (fizeram login ou transação)
      prisma.user.count({
        where: {
          OR: [
            { loggedIn: true },
            {
              deposits: {
                some: {
                  createdAt: { gte: today },
                },
              },
            },
            {
              withdrawals: {
                some: {
                  createdAt: { gte: today },
                },
              },
            },
          ],
        },
      }),

      // Total de depósitos aprovados
      prisma.deposit.aggregate({
        where: { status: 1 },
        _sum: { amount: true },
        _count: true,
      }),

      // Total de saques aprovados
      prisma.withdrawal.aggregate({
        where: { status: 1 },
        _sum: { amount: true },
        _count: true,
      }),

      // Depósitos pendentes
      prisma.deposit.count({
        where: { status: 0 },
      }),

      // Saques pendentes
      prisma.withdrawal.count({
        where: { status: 0 },
      }),

      // Depósitos hoje
      prisma.deposit.aggregate({
        where: {
          createdAt: { gte: today },
          status: { in: [0, 1] }, // Pendentes ou aprovados
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Saques hoje
      prisma.withdrawal.aggregate({
        where: {
          createdAt: { gte: today },
          status: { in: [0, 1] }, // Pendentes ou aprovados
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Saldo total do sistema
      prisma.wallet.aggregate({
        _sum: {
          balance: true,
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        activeToday: activeUsersToday,
      },
      deposits: {
        total: {
          value: totalDepositsValue._sum.amount || 0,
          count: totalDepositsValue._count,
        },
        pending: pendingDeposits,
        today: {
          value: depositsToday._sum.amount || 0,
          count: depositsToday._count,
        },
      },
      withdrawals: {
        total: {
          value: totalWithdrawalsValue._sum.amount || 0,
          count: totalWithdrawalsValue._count,
        },
        pending: pendingWithdrawals,
        today: {
          value: withdrawalsToday._sum.amount || 0,
          count: withdrawalsToday._count,
        },
      },
      systemBalance: systemWallet._sum.balance || 0,
      revenue:
        (totalDepositsValue._sum.amount?.toNumber() || 0) -
        (totalWithdrawalsValue._sum.amount?.toNumber() || 0),
    };
  }

  /**
   * Obter últimas transações
   */
  async getRecentTransactions(limit: number = 10) {
    const [deposits, withdrawals] = await Promise.all([
      prisma.deposit.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.withdrawal.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Combinar e ordenar
    const transactions = [
      ...deposits.map((d) => ({
        id: d.id,
        type: 'deposit' as const,
        userId: d.userId,
        user: d.user,
        amount: d.amount,
        status: d.status,
        createdAt: d.createdAt,
      })),
      ...withdrawals.map((w) => ({
        id: w.id,
        type: 'withdrawal' as const,
        userId: w.userId,
        user: w.user,
        amount: w.amount,
        status: w.status,
        createdAt: w.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return transactions.slice(0, limit);
  }

  /**
   * Obter dados para gráfico de receita (últimos 7 dias)
   */
  async getRevenueChart(days: number = 7) {
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [deposits, withdrawals] = await Promise.all([
        prisma.deposit.aggregate({
          where: {
            status: 1,
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
          _sum: { amount: true },
        }),
        prisma.withdrawal.aggregate({
          where: {
            status: 1,
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
          _sum: { amount: true },
        }),
      ]);

      result.push({
        date: date.toISOString().split('T')[0],
        deposits: deposits._sum.amount?.toNumber() || 0,
        withdrawals: withdrawals._sum.amount?.toNumber() || 0,
        revenue:
          (deposits._sum.amount?.toNumber() || 0) -
          (withdrawals._sum.amount?.toNumber() || 0),
      });
    }

    return result;
  }
}

