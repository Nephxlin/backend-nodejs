import prisma from '../../config/database';

export class AdminVipsService {
  /**
   * Listar todos os níveis VIP
   */
  async listVips() {
    return await prisma.vip.findMany({
      orderBy: { level: 'asc' },
      include: {
        _count: {
          select: { vipUsers: true },
        },
      },
    });
  }

  /**
   * Obter VIP por ID
   */
  async getVip(vipId: number) {
    const vip = await prisma.vip.findUnique({
      where: { id: vipId },
      include: {
        vipUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 20,
          orderBy: { points: 'desc' },
        },
      },
    });

    if (!vip) {
      throw new Error('Nível VIP não encontrado');
    }

    return vip;
  }

  /**
   * Criar nível VIP
   */
  async createVip(data: any) {
    // Verificar se o nível já existe
    const existingVip = await prisma.vip.findUnique({
      where: { level: data.level },
    });

    if (existingVip) {
      throw new Error('Já existe um nível VIP com este número');
    }

    return await prisma.vip.create({
      data,
    });
  }

  /**
   * Atualizar nível VIP
   */
  async updateVip(vipId: number, data: any) {
    const vip = await prisma.vip.findUnique({
      where: { id: vipId },
    });

    if (!vip) {
      throw new Error('Nível VIP não encontrado');
    }

    // Se mudou o nível, verificar se não existe outro com mesmo número
    if (data.level && data.level !== vip.level) {
      const existingVip = await prisma.vip.findUnique({
        where: { level: data.level },
      });

      if (existingVip) {
        throw new Error('Já existe um nível VIP com este número');
      }
    }

    return await prisma.vip.update({
      where: { id: vipId },
      data,
    });
  }

  /**
   * Deletar nível VIP
   */
  async deleteVip(vipId: number) {
    const vip = await prisma.vip.findUnique({
      where: { id: vipId },
      include: {
        _count: {
          select: { vipUsers: true },
        },
      },
    });

    if (!vip) {
      throw new Error('Nível VIP não encontrado');
    }

    if (vip._count.vipUsers > 0) {
      throw new Error(
        'Não é possível deletar nível VIP que possui usuários associados'
      );
    }

    await prisma.vip.delete({
      where: { id: vipId },
    });

    return { success: true, message: 'Nível VIP deletado com sucesso' };
  }
}

