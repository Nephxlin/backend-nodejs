import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import { WithdrawalController } from '../controllers/withdrawal.controller';
import { DepositController } from '../controllers/deposit.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createDepositSchema, verifyDepositSchema } from '../models/deposit.schemas';

const router = Router();
const walletController = new WalletController();
const withdrawalController = new WithdrawalController();
const depositController = new DepositController();

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

/**
 * @route POST /api/wallet/deposit
 * @desc Criar depósito via PIX
 * @access Private
 */
router.post(
  '/deposit',
  validateRequest(createDepositSchema),
  (req, res) => depositController.createDeposit(req, res)
);

/**
 * @route POST /api/wallet/deposit/verify
 * @desc Verificar status do depósito
 * @access Private
 */
router.post(
  '/deposit/verify',
  validateRequest(verifyDepositSchema),
  (req, res) => depositController.verifyDeposit(req, res)
);

/**
 * @route GET /api/wallet/deposits
 * @desc Listar depósitos do usuário
 * @access Private
 */
router.get('/deposits', (req, res) => depositController.listDeposits(req, res));

/**
 * @route POST /api/wallet/withdraw
 * @desc Solicitar saque
 * @access Private
 */
router.post('/withdraw', (req, res) => withdrawalController.requestWithdrawal(req, res));

/**
 * @route GET /api/wallet/withdrawals
 * @desc Listar saques
 * @access Private
 */
router.get('/withdrawals', (req, res) => withdrawalController.listWithdrawals(req, res));

/**
 * @route DELETE /api/wallet/withdrawals/:id
 * @desc Cancelar saque
 * @access Private
 */
router.delete('/withdrawals/:id', (req, res) =>
  withdrawalController.cancelWithdrawal(req, res)
);

export default router;

