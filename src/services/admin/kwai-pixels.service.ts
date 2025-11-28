import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreatePixelData {
  pixelId: string;
  accessToken?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface UpdatePixelData {
  pixelId?: string;
  accessToken?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class KwaiPixelsService {
  /**
   * Listar todos os pixels
   */
  async listPixels() {
    const pixels = await prisma.kwaiPixel.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return pixels;
  }

  /**
   * Obter pixel específico
   */
  async getPixel(id: number) {
    const pixel = await prisma.kwaiPixel.findUnique({
      where: { id },
    });

    return pixel;
  }

  /**
   * Criar novo pixel
   */
  async createPixel(data: CreatePixelData) {
    // Verificar se já existe pixel com este pixelId
    const existing = await prisma.kwaiPixel.findUnique({
      where: { pixelId: data.pixelId },
    });

    if (existing) {
      throw new Error('Já existe um pixel com este ID');
    }

    const pixel = await prisma.kwaiPixel.create({
      data: {
        pixelId: data.pixelId,
        accessToken: data.accessToken,
        name: data.name,
        description: data.description,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return pixel;
  }

  /**
   * Atualizar pixel existente
   */
  async updatePixel(id: number, data: UpdatePixelData) {
    // Verificar se existe
    const existing = await prisma.kwaiPixel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Pixel não encontrado');
    }

    // Se estiver mudando o pixelId, verificar se já existe outro com esse ID
    if (data.pixelId && data.pixelId !== existing.pixelId) {
      const duplicated = await prisma.kwaiPixel.findUnique({
        where: { pixelId: data.pixelId },
      });

      if (duplicated) {
        throw new Error('Já existe um pixel com este ID');
      }
    }

    const pixel = await prisma.kwaiPixel.update({
      where: { id },
      data: {
        pixelId: data.pixelId,
        accessToken: data.accessToken,
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
    });

    return pixel;
  }

  /**
   * Deletar pixel
   */
  async deletePixel(id: number) {
    const existing = await prisma.kwaiPixel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Pixel não encontrado');
    }

    await prisma.kwaiPixel.delete({
      where: { id },
    });

    return { message: 'Pixel deletado com sucesso' };
  }

  /**
   * Ativar/Desativar pixel
   */
  async togglePixelStatus(id: number, isActive: boolean) {
    const existing = await prisma.kwaiPixel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Pixel não encontrado');
    }

    const pixel = await prisma.kwaiPixel.update({
      where: { id },
      data: { isActive },
    });

    return pixel;
  }

  /**
   * Listar apenas pixels ativos (para frontend)
   */
  async listActivePixels() {
    const pixels = await prisma.kwaiPixel.findMany({
      where: { isActive: true },
      select: {
        id: true,
        pixelId: true,
        name: true,
        // Não retornar accessToken para o frontend
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return pixels;
  }

  /**
   * Obter pixels com access token (para uso server-side)
   */
  async getPixelsWithAccessToken() {
    const pixels = await prisma.kwaiPixel.findMany({
      where: {
        isActive: true,
        accessToken: {
          not: null,
        },
      },
      select: {
        id: true,
        pixelId: true,
        accessToken: true,
        name: true,
      },
    });

    return pixels;
  }
}

