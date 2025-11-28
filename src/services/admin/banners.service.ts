import prisma from '../../config/database';

export class AdminBannersService {
  /**
   * Listar todos os banners
   */
  async listBanners(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [banners, total] = await Promise.all([
      prisma.banner.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.banner.count(),
    ]);

    return {
      banners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obter banner por ID
   */
  async getBanner(bannerId: number) {
    const banner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new Error('Banner não encontrado');
    }

    return banner;
  }

  /**
   * Criar banner
   */
  async createBanner(data: any) {
    return await prisma.banner.create({
      data,
    });
  }

  /**
   * Atualizar banner
   */
  async updateBanner(bannerId: number, data: any) {
    const banner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new Error('Banner não encontrado');
    }

    return await prisma.banner.update({
      where: { id: bannerId },
      data,
    });
  }

  /**
   * Deletar banner
   */
  async deleteBanner(bannerId: number) {
    const banner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new Error('Banner não encontrado');
    }

    await prisma.banner.delete({
      where: { id: bannerId },
    });

    return { success: true, message: 'Banner deletado com sucesso' };
  }

  /**
   * Toggle status do banner
   */
  async toggleBannerStatus(bannerId: number) {
    const banner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new Error('Banner não encontrado');
    }

    return await prisma.banner.update({
      where: { id: bannerId },
      data: {
        isActive: !banner.isActive,
      },
    });
  }
}

