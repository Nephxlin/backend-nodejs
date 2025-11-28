import prisma from '../../config/database';

export class AdminCategoriesService {
  /**
   * Listar todas as categorias
   */
  async listCategories(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { games: true },
          },
        },
      }),
      prisma.category.count(),
    ]);

    return {
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obter categoria por ID
   */
  async getCategory(categoryId: number) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        games: {
          include: {
            game: true,
          },
          take: 10,
        },
      },
    });

    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    return category;
  }

  /**
   * Criar categoria
   */
  async createCategory(data: any) {
    // Converter strings vazias em null
    if (data.description === '') data.description = null;
    if (data.image === '') data.image = null;
    if (data.slug === '') data.slug = null;

    // Gerar slug automaticamente se não for fornecido
    if (!data.slug && data.name) {
      data.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífen
        .replace(/-+/g, '-') // Remove hífens duplicados
        .trim();
    }

    return await prisma.category.create({
      data,
    });
  }

  /**
   * Atualizar categoria
   */
  async updateCategory(categoryId: number, data: any) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    // Converter strings vazias em null
    if (data.description === '') data.description = null;
    if (data.image === '') data.image = null;
    if (data.slug === '') data.slug = null;

    // Gerar slug automaticamente se não for fornecido mas o nome foi alterado
    if (!data.slug && data.name) {
      data.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    return await prisma.category.update({
      where: { id: categoryId },
      data,
    });
  }

  /**
   * Deletar categoria
   */
  async deleteCategory(categoryId: number) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    // Deletar associações primeiro
    await prisma.categoryGame.deleteMany({
      where: { categoryId },
    });

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return { success: true, message: 'Categoria deletada com sucesso' };
  }

  /**
   * Vincular jogos a uma categoria
   */
  async addGamesToCategory(categoryId: number, gameIds: number[]) {
    // Verificar se categoria existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    // Verificar quais jogos já estão vinculados
    const existingLinks = await prisma.categoryGame.findMany({
      where: {
        categoryId,
        gameId: { in: gameIds },
      },
    });

    const existingGameIds = existingLinks.map((link) => link.gameId);
    const newGameIds = gameIds.filter((id) => !existingGameIds.includes(id));

    // Criar novos vínculos
    if (newGameIds.length > 0) {
      await prisma.categoryGame.createMany({
        data: newGameIds.map((gameId) => ({
          categoryId,
          gameId,
        })),
      });
    }

    return {
      success: true,
      added: newGameIds.length,
      skipped: existingGameIds.length,
      message: `${newGameIds.length} jogo(s) vinculado(s) à categoria`,
    };
  }

  /**
   * Remover jogo de uma categoria
   */
  async removeGameFromCategory(categoryId: number, gameId: number) {
    const link = await prisma.categoryGame.findFirst({
      where: {
        categoryId,
        gameId,
      },
    });

    if (!link) {
      throw new Error('Jogo não está vinculado a esta categoria');
    }

    await prisma.categoryGame.delete({
      where: { id: link.id },
    });

    return {
      success: true,
      message: 'Jogo removido da categoria',
    };
  }

  /**
   * Obter jogos de uma categoria
   */
  async getCategoryGames(categoryId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [categoryGames, total] = await Promise.all([
      prisma.categoryGame.findMany({
        where: { categoryId },
        include: {
          game: {
            include: {
              provider: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { order: 'asc' }, // Ordenar por ordem customizada
      }),
      prisma.categoryGame.count({
        where: { categoryId },
      }),
    ]);

    return {
      games: categoryGames.map((cg) => ({
        id: cg.game.id,
        name: cg.game.gameName,
        code: cg.game.gameCode,
        cover: cg.game.cover,
        provider: cg.game.provider.name,
        status: cg.game.status,
        order: cg.order, // Incluir ordem
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
   * Reordenar jogos de uma categoria
   */
  async reorderCategoryGames(categoryId: number, gameIds: number[]) {
    // Atualizar a ordem de cada jogo
    const updatePromises = gameIds.map((gameId, index) => {
      return prisma.categoryGame.updateMany({
        where: {
          categoryId,
          gameId,
        },
        data: {
          order: index,
        },
      });
    });

    await Promise.all(updatePromises);

    return {
      success: true,
      message: 'Ordem dos jogos atualizada',
    };
  }
}

