import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const profileController = new ProfileController();

/**
 * @route GET /api/profile/referrer/:code
 * @desc Buscar informações do indicador por código
 * @access Public (não requer autenticação)
 */
router.get('/referrer/:code', (req, res) =>
  profileController.getReferrerInfo(req, res)
);

// Todas as rotas abaixo requerem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/profile
 * @desc Obter perfil do usuário
 * @access Private
 */
router.get('/', (req, res) => profileController.getProfile(req, res));

/**
 * @route PUT /api/profile
 * @desc Atualizar perfil
 * @access Private
 */
router.put('/', (req, res) => profileController.updateProfile(req, res));

/**
 * @route PUT /api/profile/password
 * @desc Alterar senha
 * @access Private
 */
router.put('/password', (req, res) => profileController.changePassword(req, res));

/**
 * @route GET /api/profile/favorites
 * @desc Listar jogos favoritos
 * @access Private
 */
router.get('/favorites', (req, res) => profileController.getFavorites(req, res));

/**
 * @route GET /api/profile/deposits
 * @desc Histórico de depósitos
 * @access Private
 */
router.get('/deposits', (req, res) => profileController.getDepositHistory(req, res));

/**
 * @route GET /api/profile/withdrawals
 * @desc Histórico de saques
 * @access Private
 */
router.get('/withdrawals', (req, res) =>
  profileController.getWithdrawalHistory(req, res)
);

/**
 * @route GET /api/profile/wallet-history
 * @desc Histórico de mudanças na carteira
 * @access Private
 */
router.get('/wallet-history', (req, res) =>
  profileController.getWalletHistory(req, res)
);

/**
 * @route GET /api/profile/referral-stats
 * @desc Obter estatísticas de indicação
 * @access Private
 */
router.get('/referral-stats', (req, res) =>
  profileController.getReferralStats(req, res)
);

/**
 * @route GET /api/profile/rollover-history
 * @desc Histórico de rollover
 * @access Private
 */
router.get('/rollover-history', (req, res) =>
  profileController.getRolloverHistory(req, res)
);

export default router;

