import prisma from '../../config/database';

export class AdminMissionsService {
  /**
   * Listar todas as missões
   */
  async listMissions(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [missions, total] = await Promise.all([
      prisma.mission.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { missionUsers: true },
          },
        },
      }),
      prisma.mission.count(),
    ]);

    return {
      missions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obter missão por ID
   */
  async getMission(missionId: number) {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        missionUsers: {
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
          orderBy: { rounds: 'desc' },
        },
      },
    });

    if (!mission) {
      throw new Error('Missão não encontrada');
    }

    return mission;
  }

  /**
   * Criar missão
   */
  async createMission(data: any) {
    return await prisma.mission.create({
      data: {
        ...data,
        challengeStartDate: new Date(data.challengeStartDate),
        challengeEndDate: new Date(data.challengeEndDate),
      },
    });
  }

  /**
   * Atualizar missão
   */
  async updateMission(missionId: number, data: any) {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      throw new Error('Missão não encontrada');
    }

    const updateData: any = { ...data };
    if (data.challengeStartDate) {
      updateData.challengeStartDate = new Date(data.challengeStartDate);
    }
    if (data.challengeEndDate) {
      updateData.challengeEndDate = new Date(data.challengeEndDate);
    }

    return await prisma.mission.update({
      where: { id: missionId },
      data: updateData,
    });
  }

  /**
   * Deletar missão
   */
  async deleteMission(missionId: number) {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      throw new Error('Missão não encontrada');
    }

    // Deletar participações primeiro
    await prisma.missionUser.deleteMany({
      where: { missionId },
    });

    await prisma.mission.delete({
      where: { id: missionId },
    });

    return { success: true, message: 'Missão deletada com sucesso' };
  }
}

