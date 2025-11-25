import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/missions
 * @desc Listar missões disponíveis
 * @access Private
 */
router.get('/', (req, res) => {
  res.json({ status: true, message: 'Missions endpoint - Em implementação' });
});

export default router;

