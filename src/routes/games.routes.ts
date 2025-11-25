import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /api/games
 * @desc Listar todos os jogos
 * @access Public/Private (opcional)
 */
router.get('/', optionalAuthMiddleware, (req, res) => {
  res.json({ status: true, message: 'Games endpoint - Em implementação' });
});

/**
 * @route GET /api/games/featured
 * @desc Listar jogos em destaque
 * @access Public
 */
router.get('/featured', (req, res) => {
  res.json({ status: true, message: 'Featured games - Em implementação' });
});

/**
 * @route GET /api/games/:id
 * @desc Obter detalhes do jogo e lançar
 * @access Private
 */
router.get('/:id', authMiddleware, (req, res) => {
  res.json({ status: true, message: 'Game detail - Em implementação' });
});

export default router;

