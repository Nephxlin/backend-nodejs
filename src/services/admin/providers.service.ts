import prisma from '../../config/database';

export class AdminProvidersService {
  /**
   * Listar todos os provedores
   */
  async listProviders(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { games: true },
          },
        },
      }),
      prisma.provider.count(),
    ]);

    return {
      providers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obter provedor por ID
   */
  async getProvider(providerId: number) {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        games: {
          take: 10,
          orderBy: { views: 'desc' },
        },
      },
    });

    if (!provider) {
      throw new Error('Provedor não encontrado');
    }

    return provider;
  }

  /**
   * Criar provedor
   */
  async createProvider(data: any) {
    return await prisma.provider.create({
      data,
    });
  }

  /**
   * Atualizar provedor
   */
  async updateProvider(providerId: number, data: any) {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new Error('Provedor não encontrado');
    }

    return await prisma.provider.update({
      where: { id: providerId },
      data,
    });
  }

  /**
   * Deletar provedor
   */
  async deleteProvider(providerId: number) {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        _count: {
          select: { games: true },
        },
      },
    });

    if (!provider) {
      throw new Error('Provedor não encontrado');
    }

    if (provider._count.games > 0) {
      throw new Error(
        'Não é possível deletar provedor que possui jogos associados'
      );
    }

    await prisma.provider.delete({
      where: { id: providerId },
    });

    return { success: true, message: 'Provedor deletado com sucesso' };
  }
}

