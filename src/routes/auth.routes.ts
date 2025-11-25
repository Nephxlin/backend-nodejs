import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { authLimiter } from '../middlewares/ratelimit.middleware';
import {
  registerSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
} from '../models/auth.schemas';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /api/auth/register
 * @desc Registrar novo usuário
 * @access Public
 */
router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  (req, res) => authController.register(req, res)
);

/**
 * @route POST /api/auth/login
 * @desc Login de usuário
 * @access Public
 */
router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  (req, res) => authController.login(req, res)
);

/**
 * @route POST /api/auth/logout
 * @desc Logout do usuário
 * @access Private
 */
router.post(
  '/logout',
  authMiddleware,
  (req, res) => authController.logout(req, res)
);

/**
 * @route GET /api/auth/me
 * @desc Obter dados do usuário autenticado
 * @access Private
 */
router.get(
  '/me',
  authMiddleware,
  (req, res) => authController.me(req, res)
);

/**
 * @route GET /api/auth/verify
 * @desc Verificar autenticação
 * @access Private
 */
router.get(
  '/verify',
  authMiddleware,
  (req, res) => authController.verify(req, res)
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh token
 * @access Private
 */
router.post(
  '/refresh',
  authMiddleware,
  (req, res) => authController.refresh(req, res)
);

/**
 * @route POST /api/auth/forget-password
 * @desc Solicitar reset de senha
 * @access Public
 */
router.post(
  '/forget-password',
  validateRequest(forgetPasswordSchema),
  (req, res) => authController.submitForgetPassword(req, res)
);

/**
 * @route POST /api/auth/reset-password
 * @desc Resetar senha
 * @access Public
 */
router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  (req, res) => authController.submitResetPassword(req, res)
);

export default router;

