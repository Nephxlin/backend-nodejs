import { Router } from 'express';
import pgsoftController from '../controllers/pgsoft.controller';

const router = Router();

/**
 * @route POST /api/pgsoft/user_balance
 * @desc Callback do PGSoft para obter saldo do usuário
 * @access Public (chamado pela API PGSoft)
 */
router.post('/user_balance', (req, res) => pgsoftController.getUserBalance(req, res));

/**
 * @route POST /api/pgsoft/game_callback
 * @desc Callback do PGSoft para processar apostas e ganhos
 * @access Public (chamado pela API PGSoft)
 */
router.post('/game_callback', (req, res) => pgsoftController.gameCallback(req, res));

export default router;
