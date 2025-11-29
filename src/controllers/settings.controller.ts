import { Request, Response } from 'express';
import prisma from '../config/database';
import { successResponse, errorResponse } from '../utils/response';

export class SettingsController {
  /**
   * Obter configurações públicas
   */
  async getSettings(_req: Request, res: Response): Promise<Response> {
    try {
      const settings = await prisma.setting.findFirst();

      if (!settings) {
        return errorResponse(res, 'Configurações não encontradas', 404);
      }

      return successResponse(res, {
        softwareName: settings.softwareName,
        softwareDescription: settings.softwareDescription,
        softwareLogo: settings.softwareLogo,
        softwareFavicon: settings.softwareFavicon,
        currencyCode: settings.currencyCode,
        prefix: settings.prefix,
        minDeposit: Number(settings.minDeposit),
        maxDeposit: Number(settings.maxDeposit),
        minWithdrawal: Number(settings.minWithdrawal),
        maxWithdrawal: Number(settings.maxWithdrawal),
        depositBonus: Number(settings.depositBonus),
        depositBonusRollover: Number(settings.depositBonusRollover),
        depositBonusFirstOnly: settings.depositBonusFirstOnly,
        signupBonus: Number(settings.signupBonus),
        referralBonus: Number(settings.referralBonus),
        disableSpin: settings.disableSpin,
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Listar banners ativos
   */
  async getBanners(_req: Request, res: Response): Promise<Response> {
    try {
      const banners = await prisma.banner.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return successResponse(
        res,
        banners.map((banner) => ({
          id: banner.id,
          title: banner.title,
          description: banner.description,
          image: banner.image,
          link: banner.link,
        }))
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Listar categorias
   */
  async getCategories(_req: Request, res: Response): Promise<Response> {
    try {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      return successResponse(
        res,
        categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          image: cat.image,
          slug: cat.slug,
        }))
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Listar providers
   */
  async getProviders(_req: Request, res: Response): Promise<Response> {
    try {
      const providers = await prisma.provider.findMany({
        where: {
          status: 1,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return successResponse(
        res,
        providers.map((prov) => ({
          id: prov.id,
          code: prov.code,
          name: prov.name,
          rtp: prov.rtp,
        }))
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Listar categorias com jogos (para frontend)
   */
  async getCategoriesWithGames(req: Request, res: Response): Promise<Response> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const categories = await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
        include: {
          games: {
            where: {
              game: {
                status: 1,
              },
            },
            take: limit,
            include: {
              game: {
                include: {
                  provider: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      return successResponse(
        res,
        categories
          .filter((cat) => cat.games.length > 0)
          .map((cat) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            image: cat.image,
            slug: cat.slug,
            games: cat.games.map((cg) => ({
              id: cg.game.id,
              name: cg.game.gameName,
              code: cg.game.gameCode,
              cover: cg.game.cover,
              status: cg.game.status,
              provider: {
                id: cg.game.provider.id,
                name: cg.game.provider.name,
                code: cg.game.provider.code,
              },
            })),
          }))
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Obter pixels Kwai ativos (públicos, com access token)
   */
  async getKwaiPixels(_req: Request, res: Response): Promise<Response> {
    try {
      const pixels = await prisma.kwaiPixel.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          pixelId: true,
          accessToken: true,
          name: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return successResponse(res, pixels);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

