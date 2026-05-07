import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authService } from '../services/auth.service.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authLimiter, registerValidation, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.registerUser({ username, email, password });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', authLimiter, loginValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal, but we can log it)
 */
router.post('/logout', authenticate, async (req, res) => {
  logger.info(`User ${req.user.id} logged out`);
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;