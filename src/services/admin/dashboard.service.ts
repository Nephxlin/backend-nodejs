import prisma from '../../config/database';

export class AdminDashboardService {
  /**
   * Obter estatísticas gerais do dashboard
   */
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Data de 7 dias atrás para estatísticas de cancelamento
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsersToday,
      totalDepositsValue,
      totalWithdrawalsValue,
      pendingDeposits,
      pendingWithdrawals,
      depositsToday,
      withdrawalsToday,
      canceledDepositsToday,
      canceledDepositsWeek,
      canceledWithdrawalsToday,
      canceledWithdrawalsWeek,
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
      prisma.deposit.aggregate({
        where: { status: 0 },
        _sum: { amount: true },
        _count: true,
      }),

      // Saques pendentes
      prisma.withdrawal.aggregate({
        where: { status: 0 },
        _sum: { amount: true },
        _count: true,
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

      // Depósitos cancelados automaticamente hoje
      prisma.deposit.aggregate({
        where: {
          status: 2, // Não pago/Cancelado
          updatedAt: { gte: today }, // Atualizados hoje (cancelados hoje)
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Depósitos cancelados automaticamente nos últimos 7 dias
      prisma.deposit.aggregate({
        where: {
          status: 2, // Não pago/Cancelado
          updatedAt: { gte: sevenDaysAgo }, // Atualizados nos últimos 7 dias
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Saques cancelados automaticamente hoje
      prisma.withdrawal.aggregate({
        where: {
          status: 2, // Não pago/Cancelado
          updatedAt: { gte: today }, // Atualizados hoje (cancelados hoje)
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Saques cancelados automaticamente nos últimos 7 dias
      prisma.withdrawal.aggregate({
        where: {
          status: 2, // Não pago/Cancelado
          updatedAt: { gte: sevenDaysAgo }, // Atualizados nos últimos 7 dias
        },
        _sum: { amount: true },
        _count: true,
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
        pending: {
          value: pendingDeposits._sum.amount || 0,
          count: pendingDeposits._count,
        },
        today: {
          value: depositsToday._sum.amount || 0,
          count: depositsToday._count,
        },
        canceled: {
          today: {
            value: canceledDepositsToday._sum.amount || 0,
            count: canceledDepositsToday._count,
          },
          week: {
            value: canceledDepositsWeek._sum.amount || 0,
            count: canceledDepositsWeek._count,
          },
        },
      },
      withdrawals: {
        total: {
          value: totalWithdrawalsValue._sum.amount || 0,
          count: totalWithdrawalsValue._count,
        },
        pending: {
          value: pendingWithdrawals._sum.amount || 0,
          count: pendingWithdrawals._count,
        },
        today: {
          value: withdrawalsToday._sum.amount || 0,
          count: withdrawalsToday._count,
        },
        canceled: {
          today: {
            value: canceledWithdrawalsToday._sum.amount || 0,
            count: canceledWithdrawalsToday._count,
          },
          week: {
            value: canceledWithdrawalsWeek._sum.amount || 0,
            count: canceledWithdrawalsWeek._count,
          },
        },
      },
      systemBalance: totalDepositsValue._sum.amount || 0,
      revenue:
        (totalDepositsValue._sum.amount?.toNumber() || 0) -
        (totalWithdrawalsValue._sum.amount?.toNumber() || 0),
    };
  }

  /**
   * Obter últimas transações com paginação
   */
  async getRecentTransactions(page: number = 1, limit: number = 10) {
    // Buscar mais transações para garantir que temos o suficiente após mesclagem
    const fetchLimit = limit * 3;

    const [deposits, withdrawals] = await Promise.all([
      prisma.deposit.findMany({
        take: fetchLimit,
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
        take: fetchLimit,
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

    // Combinar e ordenar todas as transações
    const allTransactions = [
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

    // Contar total de transações
    const [totalDeposits, totalWithdrawals] = await Promise.all([
      prisma.deposit.count(),
      prisma.withdrawal.count(),
    ]);
    const total = totalDeposits + totalWithdrawals;

    // Aplicar paginação
    const skip = (page - 1) * limit;
    const paginatedTransactions = allTransactions.slice(skip, skip + limit);

    return {
      transactions: paginatedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Obter transações canceladas automaticamente
   */
  async getCanceledTransactions(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [canceledDeposits, canceledWithdrawals] = await Promise.all([
      prisma.deposit.findMany({
        where: {
          status: 2, // Não pago/Cancelado
          updatedAt: { gte: startDate },
        },
        take: 50, // Limitar a 50 registros
        orderBy: { updatedAt: 'desc' },
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
        where: {
          status: 2, // Não pago/Cancelado
          updatedAt: { gte: startDate },
        },
        take: 50, // Limitar a 50 registros
        orderBy: { updatedAt: 'desc' },
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

    // Combinar e ordenar por data de cancelamento
    const allCanceled = [
      ...canceledDeposits.map((d) => ({
        id: d.id,
        type: 'deposit' as const,
        userId: d.userId,
        user: d.user,
        amount: d.amount,
        status: d.status,
        createdAt: d.createdAt,
        canceledAt: d.updatedAt,
        waitTime: Math.floor(
          (d.updatedAt.getTime() - d.createdAt.getTime()) / 60000
        ), // em minutos
      })),
      ...canceledWithdrawals.map((w) => ({
        id: w.id,
        type: 'withdrawal' as const,
        userId: w.userId,
        user: w.user,
        amount: w.amount,
        status: w.status,
        createdAt: w.createdAt,
        canceledAt: w.updatedAt,
        waitTime: Math.floor(
          (w.updatedAt.getTime() - w.createdAt.getTime()) / 60000
        ), // em minutos
      })),
    ].sort((a, b) => b.canceledAt.getTime() - a.canceledAt.getTime());

    return allCanceled;
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

