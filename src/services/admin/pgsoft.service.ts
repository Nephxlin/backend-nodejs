import prisma from '../../config/database';
import axios from 'axios';

interface PGSoftGame {
  code: string;
  id: string;
  name: string;
}

export class PGSoftService {
  /**
   * Lista de jogos PGSoft disponíveis na API Node
   * Estes são os jogos que existem na api-pgsoft-node
   */
  private readonly availableGames: PGSoftGame[] = [
    { code: 'fortune-tiger', id: '126', name: 'Fortune Tiger' },
    { code: 'fortune-ox', id: '98', name: 'Fortune Ox' },
    { code: 'fortune-dragon', id: '1695365', name: 'Fortune Dragon' },
    { code: 'fortune-rabbit', id: '1543462', name: 'Fortune Rabbit' },
    { code: 'fortune-mouse', id: '68', name: 'Fortune Mouse' },
    { code: 'fortune-gods', id: '3', name: 'Fortune Gods' },
    { code: 'bikini-paradise', id: '69', name: 'Bikini Paradise' },
    { code: 'jungle-delight', id: '40', name: 'Jungle Delight' },
    { code: 'ganesha-gold', id: '42', name: 'Ganesha Gold' },
    { code: 'double-fortune', id: '48', name: 'Double Fortune' },
    { code: 'dragon-tiger-luck', id: '63', name: 'Dragon Tiger Luck' },
    { code: 'ninja-raccoon', id: '1529867', name: 'Ninja Raccoon' },
    { code: 'lucky-clover', id: '1601012', name: 'Lucky Clover' },
    { code: 'ultimate-striker', id: '1489936', name: 'Ultimate Striker' },
    { code: 'prosper-ftree', id: '1312883', name: 'Prosperity Fortune Tree' },
    { code: 'chicky-run', id: '1738001', name: 'Chicky Run' },
    { code: 'butterfly-blossom', id: '125', name: 'Butterfly Blossom' },
    { code: 'cash-mania', id: '1682240', name: 'Cash Mania' },
    { code: 'wild-bandito', id: '1', name: 'Wild Bandito' },
    { code: 'zombie-outbreak', id: '2', name: 'Zombie Outbreak' },
    { code: 'majestic-ts', id: '3', name: 'Majestic Treasures' },
    { code: 'thai-river', id: '4', name: 'Thai River Wonders' },
    { code: 'shaolin-soccer', id: '5', name: 'Shaolin Soccer' },
    { code: 'gdn-ice-fire', id: '6', name: 'Guardians of Ice and Fire' },
    { code: 'rise-apollo', id: '7', name: 'Rise of Apollo' },
    { code: 'wild-bounty-sd', id: '8', name: 'Wild Bounty Showdown' },
    { code: 'treasures-aztec', id: '9', name: 'Treasures of Aztec' },
    { code: 'three-cz-pigs', id: '10', name: 'Three Crazy Pigs' },
    { code: 'wings-iguazu', id: '11', name: 'Wings of Iguazu' },
    { code: 'piggy-gold', id: '12', name: 'Piggy Gold' },
  ];

  /**
   * Sincronizar jogos PGSoft do Node API para o banco de dados
   */
  async syncGames(pgsoftApiUrl: string) {
    const results = {
      created: 0,
      existing: 0,
      errors: [] as string[],
    };

    // Buscar ou criar provider PGSoft
    let provider = await prisma.provider.findFirst({
      where: {
        code: 'pgsoft',
        distribution: 'pgsoft',
      },
    });

    if (!provider) {
      provider = await prisma.provider.create({
        data: {
          code: 'pgsoft',
          name: 'PG Soft',
          rtp: 95,
          status: 1,
          distribution: 'pgsoft',
        },
      });
    }

    // Sincronizar cada jogo
    for (const gameData of this.availableGames) {
      try {
        // Verificar se o jogo já existe
        const existingGame = await prisma.game.findFirst({
          where: {
            gameCode: gameData.code,
            distribution: 'pgsoft',
          },
        });

        if (existingGame) {
          results.existing++;
          continue;
        }

        // Baixar thumbnail do jogo
        const coverPath = await this.downloadGameThumbnail(
          gameData.code,
          pgsoftApiUrl
        );

        // Criar o jogo no banco
        await prisma.game.create({
          data: {
            providerId: provider.id,
            gameId: gameData.id,
            gameCode: gameData.code,
            gameName: gameData.name,
            technology: 'html5',
            distribution: 'pgsoft',
            rtp: 95,
            cover: coverPath,
            status: 1,
            gameType: 'slot',
            hasLobby: 0,
            isMobile: 1,
            hasFreespins: 1,
            hasTables: 0,
            onlyDemo: 0,
            views: 0,
            isFeatured: 0,
            showHome: 1,
          },
        });

        results.created++;
      } catch (error: any) {
        results.errors.push(`${gameData.name}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Baixar thumbnail do jogo da API PGSoft Node
   */
  private async downloadGameThumbnail(
    gameCode: string,
    pgsoftApiUrl: string
  ): Promise<string> {
    try {
      // A API Node.js serve imagens estáticas da pasta public
      // URL esperada: http://localhost:PORT/{gameCode}/logo.png
      const thumbnailUrl = `${pgsoftApiUrl}/${gameCode}/logo.png`;

      // Verificar se a imagem existe
      const response = await axios.head(thumbnailUrl, { timeout: 5000 });

      if (response.status === 200) {
        // Retornar URL relativa para armazenar no banco
        return `pgsoft/${gameCode}.png`;
      }
    } catch (error) {
      console.warn(`Thumbnail não encontrado para ${gameCode}, usando padrão`);
    }

    // Se não conseguir baixar, usar placeholder
    return `pgsoft/placeholder.png`;
  }

  /**
   * Obter URL da API PGSoft Node das configurações
   */
  async getPGSoftApiUrl(): Promise<string | null> {
    const settings = await prisma.gamesKey.findFirst();

    if (!settings || !settings.pgsoft) {
      return null;
    }

    return settings.pgsoft;
  }

  /**
   * Listar todos os jogos disponíveis
   */
  getAvailableGames() {
    return this.availableGames;
  }
}

