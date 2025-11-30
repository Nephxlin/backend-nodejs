import prisma from '../config/database';
import axios from 'axios';
import logger from '../config/logger';
import { config } from '../config/env';

export class GamesService {
  /**
   * Listar jogos com filtros e paginação
   */
  async listGames(
    page: number = 1,
    limit: number = 20,
    search?: string,
    categoryId?: number,
    providerId?: number,
    status: number = 1
  ) {
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      status,
      showHome: 1,
    };

    if (search) {
      where.gameName = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (providerId) {
      where.providerId = providerId;
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId,
        },
      };
    }

    // Buscar jogos
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          provider: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          views: 'desc',
        },
      }),
      prisma.game.count({ where }),
    ]);

    return {
      games: games.map((game) => ({
        id: game.id,
        name: game.gameName,
        code: game.gameCode,
        cover: game.cover,
        provider: game.provider.name,
        providerCode: game.provider.code,
        type: game.gameType,
        isFeatured: game.isFeatured === 1,
        views: game.views,
        categories: game.categories.map((c) => c.category.name),
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
   * Buscar jogo por ID
   */
  async getGameById(gameId: number) {
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

    if (game.status !== 1) {
      throw new Error('Jogo não disponível');
    }

    return {
      id: game.id,
      name: game.gameName,
      code: game.gameCode,
      cover: game.cover,
      description: game.description,
      provider: game.provider.name,
      providerCode: game.provider.code,
      type: game.gameType,
      rtp: game.rtp,
      isFeatured: game.isFeatured === 1,
      isMobile: game.isMobile === 1,
      hasFreespins: game.hasFreespins === 1,
      views: game.views,
      categories: game.categories.map((c) => ({
        id: c.category.id,
        name: c.category.name,
        slug: c.category.slug,
      })),
    };
  }

  /**
   * Lançar jogo PGSoft
   */
  async launchGame(gameId: number, userId: number) {
    // Buscar jogo
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        provider: true,
      },
    });

    if (!game) {
      throw new Error('Jogo não encontrado');
    }

    if (game.status !== 1) {
      throw new Error('Jogo não disponível no momento');
    }

    // Buscar carteira do usuário
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Carteira não encontrada');
    }

    // Verificar se usuário tem saldo
    const totalBalance = Number(wallet.balance) + Number(wallet.balanceBonus);
    if (totalBalance <= 0) {
      throw new Error('Saldo insuficiente para jogar');
    }

    // Incrementar views do jogo
    await prisma.game.update({
      where: { id: gameId },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // Se for PGSoft, lançar via API Node
    if (game.distribution === 'pgsoft' || game.provider.code === 'pgsoft') {
      return await this.launchPGSoftGame(game, userId, totalBalance);
    }

    // Para outros providers, retornar erro (implementar futuramente)
    throw new Error('Provider não suportado ainda');
  }

  /**
   * Lançar jogo PGSoft via API Node
   * Comportamento idêntico ao cassino-cactus PGSoftTrait::GameLaunchPGSoft
   */
  private async launchPGSoftGame(game: any, userId: number, userBalance: number) {
    try {
      // Buscar credenciais PGSoft (igual ao cassino-cactus)
      const gamesKey = await prisma.gamesKey.findFirst();

      if (!gamesKey) {
        logger.error('PGSoft: Credenciais não configuradas');
        throw new Error('Credenciais PGSoft não configuradas');
      }

      // Priorizar variável de ambiente para a URL da API (útil para desenvolvimento local)
      let pgsoftApiUrl = config.pgsoft.apiUrl || gamesKey.pgsoft;
      
      if (!pgsoftApiUrl) {
        logger.error('PGSoft: URL da API não configurada');
        throw new Error('URL da API PGSoft não configurada');
      }
      
      // Remover /api ou /api/ do final da URL para evitar duplicação
      pgsoftApiUrl = pgsoftApiUrl.replace(/\/api\/?$/, '');
      
      const agentToken = gamesKey.agentToken || '';
      const secretKey = gamesKey.pgsoftSecretKey || '';
      const gameUrl = gamesKey.pgsoftGameUrl || '';

      logger.info(`PGSoft: Lançando jogo ${game.gameName} para usuário ${userId}`);
      logger.info(`PGSoft: API URL: ${pgsoftApiUrl}/api/v1/game_launch`);
      logger.info(`PGSoft: game_launch cria usuário automaticamente no MySQL se não existir`);

      // Montar payload exatamente como no cassino-cactus
      const postArray = {
        agentToken,
        secretKey,
        user_code: String(userId), // Converter para string
        game_code: game.gameCode,
        provider_code: 'PGSOFT',
        game_type: 'slot',
        user_balance: parseFloat(userBalance.toString()), // Garantir que é float
        lang: 'pt',
        game_url: gameUrl, // URL pública dos jogos
      };

      logger.info('PGSoft: Payload enviado:', { ...postArray, secretKey: '***', agentToken: '***' });

      // Fazer request para API PGSoft Node (timeout de 30 segundos como no cassino-cactus)
      const response = await axios.post(
        `${pgsoftApiUrl}/api/v1/game_launch`,
        postArray,
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      logger.info('PGSoft: Resposta recebida:', {
        status: response.status,
        data: response.data,
      });

      // Verificar se obteve sucesso (igual ao cassino-cactus: if ($response->successful()))
      if (response.status >= 200 && response.status < 300) {
        const data = response.data;

        // Verificar se tem launch_url (igual ao cassino-cactus: isset($pgsoftLaunch['launch_url']))
        if (data && data.launch_url) {
          logger.info(`PGSoft: Jogo lançado com sucesso`, {
            user_id: userId,
            game_code: game.gameCode,
            status: data.status || 'success',
          });

          // Retornar no mesmo formato do cassino-cactus
          return {
            success: true,
            gameUrl: data.launch_url,
            game: {
              id: game.id,
              name: game.gameName,
              code: game.gameCode,
            },
          };
        }

        // Se não tem launch_url, logar erro
        logger.error('PGSoft: Resposta sem launch_url', {
          user_id: userId,
          game_code: game.gameCode,
          response: data,
        });
        throw new Error('API PGSoft não retornou URL de lançamento');
      }

      throw new Error('Erro na resposta da API PGSoft');
    } catch (error: any) {
      // Log detalhado do erro (igual ao cassino-cactus)
      logger.error('PGSoft: Exceção ao lançar jogo', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        game_code: game.gameCode,
        user_id: userId,
      });

      // Retornar mensagem de erro clara
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      if (error.code === 'ECONNREFUSED') {
        throw new Error('API PGSoft não está disponível. Verifique se o serviço está rodando.');
      }

      throw new Error(error.message || 'Erro ao iniciar jogo PGSoft');
    }
  }

  /**
   * Favoritar/desfavoritar jogo
   */
  async toggleFavorite(gameId: number, userId: number) {
    // Verificar se jogo existe
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Jogo não encontrado');
    }

    // Verificar se já está favoritado
    const favorite = await prisma.gameFavorite.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    if (favorite) {
      // Remover dos favoritos
      await prisma.gameFavorite.delete({
        where: {
          id: favorite.id,
        },
      });

      return {
        isFavorite: false,
        message: 'Jogo removido dos favoritos',
      };
    } else {
      // Adicionar aos favoritos
      await prisma.gameFavorite.create({
        data: {
          userId,
          gameId,
        },
      });

      return {
        isFavorite: true,
        message: 'Jogo adicionado aos favoritos',
      };
    }
  }

  /**
   * Curtir jogo
   */
  async likeGame(gameId: number, userId: number) {
    // Verificar se jogo existe
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Jogo não encontrado');
    }

    // Verificar se já curtiu
    const like = await prisma.gameLike.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    if (like) {
      return {
        liked: true,
        message: 'Você já curtiu este jogo',
      };
    }

    // Adicionar like
    await prisma.gameLike.create({
      data: {
        userId,
        gameId,
      },
    });

    return {
      liked: true,
      message: 'Jogo curtido com sucesso',
    };
  }

  /**
   * Listar jogos em destaque
   */
  async getFeaturedGames(limit: number = 10) {
    const games = await prisma.game.findMany({
      where: {
        status: 1,
        isFeatured: 1,
        showHome: 1,
      },
      include: {
        provider: true,
      },
      take: limit,
      orderBy: {
        views: 'desc',
      },
    });

    return games.map((game) => ({
      id: game.id,
      name: game.gameName,
      code: game.gameCode,
      cover: game.cover,
      provider: game.provider.name,
      views: game.views,
    }));
  }

  /**
   * Verificar se usuário favoritou jogo
   */
  async checkFavorite(gameId: number, userId: number) {
    const favorite = await prisma.gameFavorite.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    return !!favorite;
  }
}

