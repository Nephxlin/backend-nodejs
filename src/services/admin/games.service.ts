import prisma from '../../config/database';

export class AdminGamesService {
  /**
   * Listar todos os jogos com filtros
   */
  async listGames(
    page: number = 1,
    limit: number = 20,
    search?: string,
    providerId?: number,
    status?: number
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { gameName: { contains: search, mode: 'insensitive' as const } },
        { gameCode: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (providerId) {
      where.providerId = providerId;
    }

    if (status !== undefined) {
      where.status = status;
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
      }),
      prisma.game.count({ where }),
    ]);

    return {
      games,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obter detalhes de um jogo
   */
  async getGame(gameId: number) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        provider: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!game) {
      throw new Error('Jogo não encontrado');
    }

    return game;
  }

  /**
   * Criar novo jogo
   */
  async createGame(data: any) {
    const { categories, ...gameData } = data;

    const game = await prisma.game.create({
      data: {
        ...gameData,
        categories: categories
          ? {
              create: categories.map((categoryId: number) => ({
                categoryId,
              })),
            }
          : undefined,
      },
      include: {
        provider: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return game;
  }

  /**
   * Atualizar jogo
   */
  async updateGame(gameId: number, data: any) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Jogo não encontrado');
    }

    const { categories, ...gameData } = data;

    // Se categorias foram enviadas, atualizar
    if (categories) {
      await prisma.categoryGame.deleteMany({
        where: { gameId },
      });
    }

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        ...gameData,
        categories: categories
          ? {
              create: categories.map((categoryId: number) => ({
                categoryId,
              })),
            }
          : undefined,
      },
      include: {
        provider: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return updatedGame;
  }

  /**
   * Deletar jogo
   */
  async deleteGame(gameId: number) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Jogo não encontrado');
    }

    await prisma.game.delete({
      where: { id: gameId },
    });

    return { success: true, message: 'Jogo deletado com sucesso' };
  }

  /**
   * Toggle status do jogo
   */
  async toggleGameStatus(gameId: number) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Jogo não encontrado');
    }

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        status: game.status === 1 ? 0 : 1,
      },
    });

    return updatedGame;
  }
}

