import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';

const router = Router();
const settingsController = new SettingsController();

/**
 * @route GET /api/settings
 * @desc Obter configurações públicas
 * @access Public
 */
router.get('/', (req, res) => settingsController.getSettings(req, res));

/**
 * @route GET /api/settings/banners
 * @desc Obter banners ativos
 * @access Public
 */
router.get('/banners', (req, res) => settingsController.getBanners(req, res));

/**
 * @route GET /api/settings/categories
 * @desc Listar categorias
 * @access Public
 */
router.get('/categories', (req, res) => settingsController.getCategories(req, res));

/**
 * @route GET /api/settings/providers
 * @desc Listar providers
 * @access Public
 */
router.get('/providers', (req, res) => settingsController.getProviders(req, res));

/**
 * @route GET /api/settings/categories-with-games
 * @desc Listar categorias com seus jogos
 * @access Public
 */
router.get('/categories-with-games', (req, res) =>
  settingsController.getCategoriesWithGames(req, res)
);

/**
 * @route GET /api/settings/kwai-pixels
 * @desc Obter pixels Kwai ativos (apenas pixelId, sem access token)
 * @access Public
 */
router.get('/kwai-pixels', (req, res) =>
  settingsController.getKwaiPixels(req, res)
);

export default router;

