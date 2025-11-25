import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const walletController = new WalletController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/wallet
 * @desc Obter carteira do usuário
 * @access Private
 */
router.get('/', (req, res) => walletController.getWallet(req, res));

/**
 * @route GET /api/wallet/transactions
 * @desc Obter histórico de transações
 * @access Private
 */
router.get('/transactions', (req, res) => walletController.getTransactions(req, res));

/**
 * @route GET /api/wallet/changes
 * @desc Obter histórico de mudanças na carteira
 * @access Private
 */
router.get('/changes', (req, res) => walletController.getWalletChanges(req, res));

/**
 * @route POST /api/wallet/toggle-hide-balance
 * @desc Toggle ocultar/mostrar saldo
 * @access Private
 */
router.post('/toggle-hide-balance', (req, res) =>
  walletController.toggleHideBalance(req, res)
);

export default router;

