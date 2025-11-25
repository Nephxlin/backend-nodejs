import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/profile
 * @desc Obter perfil do usuário
 * @access Private
 */
router.get('/', (req, res) => {
  res.json({ status: true, message: 'Profile endpoint - Em implementação' });
});

/**
 * @route PUT /api/profile
 * @desc Atualizar perfil
 * @access Private
 */
router.put('/', (req, res) => {
  res.json({ status: true, message: 'Update profile - Em implementação' });
});

/**
 * @route GET /api/profile/favorites
 * @desc Listar jogos favoritos
 * @access Private
 */
router.get('/favorites', (req, res) => {
  res.json({ status: true, message: 'Favorites - Em implementação' });
});

export default router;

