import prisma from '../../config/database';
import bcrypt from 'bcrypt';

export class AdminUsersService {
  /**
   * Listar todos os usuários com paginação
   */
  async listUsers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { cpf: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          cpf: true,
          phone: true,
          banned: true,
          isAdmin: true,
          createdAt: true,
          wallet: {
            select: {
              balance: true,
              balanceBonus: true,
              currency: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obter detalhes de um usuário
   */
  async getUserDetails(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        deposits: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        withdrawals: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        invitedUsers: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            wallet: {
              select: {
                balance: true,
                balanceBonus: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Contar total de indicações
    const totalReferrals = user.invitedUsers?.length || 0;

    // Remover senha do retorno
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  /**
   * Atualizar usuário
   */
  async updateUser(userId: number, data: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        banned: data.banned,
        isAdmin: data.isAdmin,
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        cpf: true,
        phone: true,
        banned: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Banir/desbanir usuário
   */
  async toggleBanUser(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: !user.banned,
      },
    });

    return updatedUser;
  }

  /**
   * Ajustar saldo da carteira manualmente
   */
  async adjustWallet(
    userId: number,
    amount: number,
    type: 'add' | 'subtract',
    targetField: 'balance' | 'bonus' = 'balance',
    description?: string
  ) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Carteira não encontrada');
    }

    const field = targetField === 'bonus' ? 'balanceBonus' : 'balance';
    const beforeBalance = wallet[field];
    const adjustment = type === 'add' ? amount : -amount;
    const afterBalance = Number(beforeBalance) + adjustment;

    if (afterBalance < 0) {
      throw new Error('Saldo insuficiente');
    }

    // Atualizar carteira e registrar mudança
    const [updatedWallet] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: {
          [field]: afterBalance,
        },
      }),
      prisma.walletChange.create({
        data: {
          userId,
          amount: adjustment,
          beforeBalance,
          afterBalance,
          type: `admin_${type}_${targetField}`,
          description: description || `Ajuste manual de ${targetField} pelo admin`,
        },
      }),
    ]);

    return updatedWallet;
  }
}

