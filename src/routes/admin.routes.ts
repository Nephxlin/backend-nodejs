import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { validateRequest } from '../middlewares/validation.middleware';

// Controllers
import { AdminUsersController } from '../controllers/admin/users.controller';
import { AdminDepositsController } from '../controllers/admin/deposits.controller';
import { AdminWithdrawalsController } from '../controllers/admin/withdrawals.controller';
import { AdminDashboardController } from '../controllers/admin/dashboard.controller';
import { AdminGamesController } from '../controllers/admin/games.controller';
import { AdminProvidersController } from '../controllers/admin/providers.controller';
import { AdminCategoriesController } from '../controllers/admin/categories.controller';
import { AdminBannersController } from '../controllers/admin/banners.controller';
import { AdminMissionsController } from '../controllers/admin/missions.controller';
import { AdminVipsController } from '../controllers/admin/vips.controller';
import { AdminSettingsController } from '../controllers/admin/settings.controller';
import { AdminKwaiPixelsController } from '../controllers/admin/kwai-pixels.controller';
import { AdminPGSoftAgentsController } from '../controllers/admin/pgsoft-agents.controller';

// Schemas
import {
  updateUserSchema,
  adjustWalletSchema,
  createGameSchema,
  updateGameSchema,
  createProviderSchema,
  updateProviderSchema,
  createCategorySchema,
  updateCategorySchema,
  createBannerSchema,
  updateBannerSchema,
  createMissionSchema,
  updateMissionSchema,
  createVipSchema,
  updateVipSchema,
  updateSettingsSchema,
  createGatewaySchema,
  updateGatewaySchema,
  updateGamesKeysSchema,
} from '../models/admin.schemas';

const router = Router();

// Instanciar controllers
const usersController = new AdminUsersController();
const depositsController = new AdminDepositsController();
const withdrawalsController = new AdminWithdrawalsController();
const dashboardController = new AdminDashboardController();
const gamesController = new AdminGamesController();
const providersController = new AdminProvidersController();
const categoriesController = new AdminCategoriesController();
const bannersController = new AdminBannersController();
const missionsController = new AdminMissionsController();
const vipsController = new AdminVipsController();
const settingsController = new AdminSettingsController();
const kwaiPixelsController = new AdminKwaiPixelsController();
const pgsoftAgentsController = new AdminPGSoftAgentsController();

// Todas as rotas requerem autenticação + admin
router.use(authMiddleware);
router.use(adminMiddleware);

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard/stats', (req, res) =>
  dashboardController.getDashboardStats(req, res)
);
router.get('/dashboard/transactions', (req, res) =>
  dashboardController.getRecentTransactions(req, res)
);
router.get('/dashboard/revenue-chart', (req, res) =>
  dashboardController.getRevenueChart(req, res)
);
router.get('/dashboard/canceled-transactions', (req, res) =>
  dashboardController.getCanceledTransactions(req, res)
);

// ============================================
// USERS
// ============================================
router.get('/users', (req, res) => usersController.listUsers(req, res));
router.get('/users/:id', (req, res) => usersController.getUserDetails(req, res));
router.put(
  '/users/:id',
  validateRequest(updateUserSchema),
  (req, res) => usersController.updateUser(req, res)
);
router.post('/users/:id/toggle-ban', (req, res) =>
  usersController.toggleBanUser(req, res)
);
router.post(
  '/users/:id/adjust-wallet',
  validateRequest(adjustWalletSchema),
  (req, res) => usersController.adjustWallet(req, res)
);

// ============================================
// DEPOSITS
// ============================================
router.get('/deposits', (req, res) => depositsController.listDeposits(req, res));
router.get('/deposits/stats', (req, res) =>
  depositsController.getDepositStats(req, res)
);
router.post('/deposits/:id/approve', (req, res) =>
  depositsController.approveDeposit(req, res)
);
router.post('/deposits/:id/reject', (req, res) =>
  depositsController.rejectDeposit(req, res)
);

// ============================================
// WITHDRAWALS
// ============================================
router.get('/withdrawals', (req, res) =>
  withdrawalsController.listWithdrawals(req, res)
);
router.get('/withdrawals/stats', (req, res) =>
  withdrawalsController.getWithdrawalStats(req, res)
);
router.post('/withdrawals/:id/approve', (req, res) =>
  withdrawalsController.approveWithdrawal(req, res)
);
router.post('/withdrawals/:id/reject', (req, res) =>
  withdrawalsController.rejectWithdrawal(req, res)
);

// ============================================
// GAMES
// ============================================
router.get('/games', (req, res) => gamesController.listGames(req, res));
router.get('/games/:id', (req, res) => gamesController.getGame(req, res));
router.post(
  '/games',
  validateRequest(createGameSchema),
  (req, res) => gamesController.createGame(req, res)
);
router.put(
  '/games/:id',
  validateRequest(updateGameSchema),
  (req, res) => gamesController.updateGame(req, res)
);
router.delete('/games/:id', (req, res) => gamesController.deleteGame(req, res));
router.post('/games/:id/toggle-status', (req, res) =>
  gamesController.toggleGameStatus(req, res)
);

// ============================================
// GAMES - PGSOFT SYNC
// ============================================
router.post('/games/pgsoft/sync', (req, res) =>
  gamesController.syncPGSoftGames(req, res)
);
router.get('/games/pgsoft/available', (req, res) =>
  gamesController.listAvailablePGSoftGames(req, res)
);
router.post('/games/upload-cover', (req, res) =>
  gamesController.uploadGameCover(req, res)
);

// ============================================
// PROVIDERS
// ============================================
router.get('/providers', (req, res) =>
  providersController.listProviders(req, res)
);
router.get('/providers/:id', (req, res) =>
  providersController.getProvider(req, res)
);
router.post(
  '/providers',
  validateRequest(createProviderSchema),
  (req, res) => providersController.createProvider(req, res)
);
router.put(
  '/providers/:id',
  validateRequest(updateProviderSchema),
  (req, res) => providersController.updateProvider(req, res)
);
router.delete('/providers/:id', (req, res) =>
  providersController.deleteProvider(req, res)
);

// ============================================
// CATEGORIES
// ============================================
router.get('/categories', (req, res) =>
  categoriesController.listCategories(req, res)
);
router.get('/categories/:id', (req, res) =>
  categoriesController.getCategory(req, res)
);
router.post(
  '/categories',
  validateRequest(createCategorySchema),
  (req, res) => categoriesController.createCategory(req, res)
);
router.put(
  '/categories/:id',
  validateRequest(updateCategorySchema),
  (req, res) => categoriesController.updateCategory(req, res)
);
router.delete('/categories/:id', (req, res) =>
  categoriesController.deleteCategory(req, res)
);
router.post('/categories/:id/games', (req, res) =>
  categoriesController.addGamesToCategory(req, res)
);
router.delete('/categories/:id/games/:gameId', (req, res) =>
  categoriesController.removeGameFromCategory(req, res)
);
router.get('/categories/:id/games', (req, res) =>
  categoriesController.getCategoryGames(req, res)
);
router.put('/categories/:id/games/reorder', (req, res) =>
  categoriesController.reorderCategoryGames(req, res)
);

// ============================================
// BANNERS
// ============================================
router.get('/banners', (req, res) => bannersController.listBanners(req, res));
router.get('/banners/:id', (req, res) => bannersController.getBanner(req, res));
router.post(
  '/banners',
  validateRequest(createBannerSchema),
  (req, res) => bannersController.createBanner(req, res)
);
router.put(
  '/banners/:id',
  validateRequest(updateBannerSchema),
  (req, res) => bannersController.updateBanner(req, res)
);
router.delete('/banners/:id', (req, res) =>
  bannersController.deleteBanner(req, res)
);
router.post('/banners/:id/toggle-status', (req, res) =>
  bannersController.toggleBannerStatus(req, res)
);
router.post('/banners/upload-image', (req, res) =>
  bannersController.uploadImage(req, res)
);

// ============================================
// MISSIONS
// ============================================
router.get('/missions', (req, res) => missionsController.listMissions(req, res));
router.get('/missions/:id', (req, res) =>
  missionsController.getMission(req, res)
);
router.post(
  '/missions',
  validateRequest(createMissionSchema),
  (req, res) => missionsController.createMission(req, res)
);
router.put(
  '/missions/:id',
  validateRequest(updateMissionSchema),
  (req, res) => missionsController.updateMission(req, res)
);
router.delete('/missions/:id', (req, res) =>
  missionsController.deleteMission(req, res)
);

// ============================================
// VIPS
// ============================================
router.get('/vips', (req, res) => vipsController.listVips(req, res));
router.get('/vips/:id', (req, res) => vipsController.getVip(req, res));
router.post(
  '/vips',
  validateRequest(createVipSchema),
  (req, res) => vipsController.createVip(req, res)
);
router.put(
  '/vips/:id',
  validateRequest(updateVipSchema),
  (req, res) => vipsController.updateVip(req, res)
);
router.delete('/vips/:id', (req, res) => vipsController.deleteVip(req, res));

// ============================================
// SETTINGS
// ============================================
router.get('/settings', (req, res) => settingsController.getSettings(req, res));
router.put(
  '/settings',
  validateRequest(updateSettingsSchema),
  (req, res) => settingsController.updateSettings(req, res)
);

// Games Keys
router.get('/settings/games-keys', (req, res) =>
  settingsController.getGamesKeys(req, res)
);
router.put(
  '/settings/games-keys',
  validateRequest(updateGamesKeysSchema),
  (req, res) => settingsController.updateGamesKeys(req, res)
);

// Gateways
router.get('/gateways', (req, res) => settingsController.listGateways(req, res));
router.post(
  '/gateways',
  validateRequest(createGatewaySchema),
  (req, res) => settingsController.createGateway(req, res)
);
router.put(
  '/gateways/:id',
  validateRequest(updateGatewaySchema),
  (req, res) => settingsController.updateGateway(req, res)
);
router.delete('/gateways/:id', (req, res) =>
  settingsController.deleteGateway(req, res)
);

// ============================================
// KWAI PIXELS
// ============================================
router.get('/kwai-pixels', (req, res) =>
  kwaiPixelsController.listPixels(req, res)
);
router.get('/kwai-pixels/active', (req, res) =>
  kwaiPixelsController.listActivePixels(req, res)
);
router.get('/kwai-pixels/:id', (req, res) =>
  kwaiPixelsController.getPixel(req, res)
);
router.post('/kwai-pixels', (req, res) =>
  kwaiPixelsController.createPixel(req, res)
);
router.put('/kwai-pixels/:id', (req, res) =>
  kwaiPixelsController.updatePixel(req, res)
);
router.delete('/kwai-pixels/:id', (req, res) =>
  kwaiPixelsController.deletePixel(req, res)
);
router.post('/kwai-pixels/:id/toggle-status', (req, res) =>
  kwaiPixelsController.togglePixelStatus(req, res)
);

// ============================================
// PGSOFT AGENTS
// ============================================
router.get('/pgsoft/agents', (req, res) =>
  pgsoftAgentsController.listAgents(req, res)
);
router.get('/pgsoft/agents/:id', (req, res) =>
  pgsoftAgentsController.getAgent(req, res)
);
router.post('/pgsoft/agents', (req, res) =>
  pgsoftAgentsController.createAgent(req, res)
);
router.put('/pgsoft/agents/:id', (req, res) =>
  pgsoftAgentsController.updateAgent(req, res)
);
router.delete('/pgsoft/agents/:id', (req, res) =>
  pgsoftAgentsController.deleteAgent(req, res)
);

export default router;

