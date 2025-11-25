import { Router } from 'express';

const router = Router();

/**
 * @route GET /api/settings
 * @desc Obter configurações públicas
 * @access Public
 */
router.get('/', (req, res) => {
  res.json({ status: true, message: 'Settings endpoint - Em implementação' });
});

/**
 * @route GET /api/settings/banners
 * @desc Obter banners
 * @access Public
 */
router.get('/banners', (req, res) => {
  res.json({ status: true, message: 'Banners - Em implementação' });
});

export default router;

