import { Router } from 'express';
import { GamesController } from '../controllers/games.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const gamesController = new GamesController();

/**
 * @route GET /api/games
 * @desc Listar todos os jogos
 * @access Public/Private (opcional)
 */
router.get('/', optionalAuthMiddleware, (req, res) =>
  gamesController.listGames(req, res)
);

/**
 * @route GET /api/games/featured
 * @desc Listar jogos em destaque
 * @access Public
 */
router.get('/featured', (req, res) =>
  gamesController.getFeaturedGames(req, res)
);

/**
 * @route GET /api/games/:id
 * @desc Obter detalhes do jogo
 * @access Public/Private (opcional)
 */
router.get('/:id', optionalAuthMiddleware, (req, res) =>
  gamesController.getGame(req, res)
);

/**
 * @route POST /api/games/:id/launch
 * @desc Lançar jogo
 * @access Private
 */
router.post('/:id/launch', authMiddleware, (req, res) =>
  gamesController.launchGame(req, res)
);

/**
 * @route POST /api/games/:id/favorite
 * @desc Favoritar/desfavoritar jogo
 * @access Private
 */
router.post('/:id/favorite', authMiddleware, (req, res) =>
  gamesController.toggleFavorite(req, res)
);

/**
 * @route POST /api/games/:id/like
 * @desc Curtir jogo
 * @access Private
 */
router.post('/:id/like', authMiddleware, (req, res) =>
  gamesController.likeGame(req, res)
);

export default router;

