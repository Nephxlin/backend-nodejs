import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { UploadService } from './upload.service';

const uploadService = new UploadService();

export class ProfileService {
  /**
   * Obter perfil completo do usuário
   */
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Calcular estatísticas
    const [totalDeposits, totalWithdrawals, favoriteGamesCount] = await Promise.all([
      prisma.deposit.aggregate({
        where: {
          userId,
          status: 1, // Aprovado
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.withdrawal.aggregate({
        where: {
          userId,
          status: 1, // Aprovado
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.gameFavorite.count({
        where: { userId },
      }),
    ]);

    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone,
      avatar: user.avatar,
      inviterCode: user.inviterCode,
      createdAt: user.createdAt,
      wallet: user.wallet
        ? {
            balance: Number(user.wallet.balance),
            balanceBonus: Number(user.wallet.balanceBonus),
            balanceWithdrawal: Number(user.wallet.balanceWithdrawal),
            balanceBonusRollover: Number(user.wallet.balanceBonusRollover),
            balanceDepositRollover: Number(user.wallet.balanceDepositRollover),
            totalBet: Number(user.wallet.totalBet),
            totalWon: Number(user.wallet.totalWon),
            totalLose: Number(user.wallet.totalLose),
            hideBalance: user.wallet.hideBalance,
            vipLevel: user.wallet.vipLevel,
            vipPoints: Number(user.wallet.vipPoints),
          }
        : null,
      statistics: {
        totalDeposits: Number(totalDeposits._sum.amount || 0),
        totalWithdrawals: Number(totalWithdrawals._sum.amount || 0),
        favoriteGamesCount,
      },
    };
  }

  /**
   * Obter estatísticas de indicação
   */
  async getReferralStats(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { inviterCode: true },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Contar indicados
    const totalReferred = await prisma.user.count({
      where: { inviter: userId },
    });

    // Calcular total de bônus ganho com indicações
    const bonusEarned = await prisma.walletChange.aggregate({
      where: {
        userId,
        type: 'referral_bonus',
      },
      _sum: {
        amount: true,
      },
    });

    // Buscar configuração de bônus
    const settings = await prisma.setting.findFirst();

    return {
      inviterCode: user.inviterCode,
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3006'}/home?ref=${user.inviterCode}`,
      totalReferred,
      bonusPerReferral: Number(settings?.referralBonus || 50),
      totalBonusEarned: Number(bonusEarned._sum.amount || 0),
    };
  }

  /**
   * Atualizar perfil
   */
  async updateProfile(
    userId: number,
    data: {
      name?: string;
      lastName?: string;
      phone?: string;
      avatar?: string;
    }
  ) {
    // Se tiver avatar em base64, fazer upload
    let avatarPath = data.avatar;
    if (data.avatar && data.avatar.startsWith('data:image')) {
      avatarPath = await uploadService.uploadBase64Image(data.avatar, 'profiles');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        lastName: data.lastName,
        phone: data.phone,
        avatar: avatarPath,
      },
    });

    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
    };
  }

  /**
   * Alterar senha
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'Senha alterada com sucesso',
    };
  }

  /**
   * Listar jogos favoritos
   */
  async getFavoriteGames(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      prisma.gameFavorite.findMany({
        where: { userId },
        include: {
          game: {
            include: {
              provider: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.gameFavorite.count({
        where: { userId },
      }),
    ]);

    return {
      games: favorites.map((fav) => ({
        id: fav.game.id,
        name: fav.game.gameName,
        code: fav.game.gameCode,
        cover: fav.game.cover,
        provider: fav.game.provider.name,
        favoritedAt: fav.createdAt,
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
   * Histórico de depósitos
   */
  async getDepositHistory(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.deposit.count({
        where: { userId },
      }),
    ]);

    return {
      deposits: deposits.map((dep) => ({
        id: dep.id,
        amount: Number(dep.amount),
        status: dep.status,
        statusText: this.getDepositStatusText(dep.status),
        type: dep.type,
        currency: dep.currency,
        symbol: dep.symbol,
        createdAt: dep.createdAt,
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
   * Histórico de saques
   */
  async getWithdrawalHistory(userId: number, page: number = 1, limit: number = 20) {
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
        statusText: this.getWithdrawalStatusText(wd.status),
        pixKey: wd.pixKey,
        pixType: wd.pixType,
        currency: wd.currency,
        symbol: wd.symbol,
        createdAt: wd.createdAt,
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
   * Histórico de mudanças na carteira
   */
  async getWalletHistory(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [changes, total] = await Promise.all([
      prisma.walletChange.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.walletChange.count({
        where: { userId },
      }),
    ]);

    return {
      changes: changes.map((change) => ({
        id: change.id,
        amount: Number(change.amount),
        beforeBalance: Number(change.beforeBalance),
        afterBalance: Number(change.afterBalance),
        type: change.type,
        description: change.description,
        createdAt: change.createdAt,
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
   * Histórico de rollover
   */
  async getRolloverHistory(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      prisma.rolloverHistory.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.rolloverHistory.count({
        where: { userId },
      }),
    ]);

    return {
      history: history.map((item) => ({
        id: item.id,
        betAmount: Number(item.betAmount),
        rolloverBefore: Number(item.rolloverBefore),
        rolloverAfter: Number(item.rolloverAfter),
        rolloverType: item.rolloverType,
        gameCode: item.gameCode,
        createdAt: item.createdAt,
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
   * Obter texto do status do depósito
   */
  private getDepositStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'Pendente',
      1: 'Aprovado',
      2: 'Cancelado',
      3: 'Rejeitado',
    };
    return statusMap[status] || 'Desconhecido';
  }

  /**
   * Buscar informações do indicador por código
   */
  async getReferrerInfo(referralCode: string) {
    const user = await prisma.user.findUnique({
      where: { inviterCode: referralCode },
      select: {
        id: true,
        name: true,
        inviterCode: true,
      },
    });

    if (!user) {
      throw new Error('Código de indicação inválido');
    }

    // Buscar configuração de bônus
    const settings = await prisma.setting.findFirst();

    return {
      referrerId: user.id,
      referrerName: user.name,
      referralCode: user.inviterCode,
      bonusAmount: Number(settings?.referralBonus || 50),
    };
  }

  /**
   * Obter texto do status do saque
   */
  private getWithdrawalStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'Pendente',
      1: 'Aprovado',
      2: 'Cancelado',
      3: 'Rejeitado',
    };
    return statusMap[status] || 'Desconhecido';
  }
}

