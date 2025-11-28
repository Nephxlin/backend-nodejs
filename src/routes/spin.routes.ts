import { Router } from 'express';
import { optionalAuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route POST /api/spin
 * @desc Executar spin na roleta
 * @access Public
 */
router.post('/', optionalAuthMiddleware, (_req, res) => {
  res.json({ status: true, message: 'Spin endpoint - Em implementação' });
});

/**
 * @route GET /api/spin/config
 * @desc Obter configuração da roleta
 * @access Public
 */
router.get('/config', (_req, res) => {
  res.json({ status: true, message: 'Spin config - Em implementação' });
});

export default router;

