import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase.js';
import { RefreshTokenUseCase } from '../../application/use-cases/RefreshTokenUseCase.js';
import { JWTService } from '../../application/services/JWTService.js';
import { UserRepository } from '../../infrastructure/repositories/UserRepository.js';
import { validate, loginSchema, refreshTokenSchema } from '../middleware/validation.js';
import { loginRateLimiter, refreshRateLimiter } from '../middleware/rateLimiter.js';

/**
 * Create and configure auth routes
 */
export function createAuthRoutes(): Router {
  const router = Router();

  // Initialize dependencies (Dependency Injection)
  const userRepository = new UserRepository();
  const jwtService = new JWTService();
  const loginUseCase = new LoginUseCase(userRepository, jwtService);
  const refreshTokenUseCase = new RefreshTokenUseCase(jwtService);
  const authController = new AuthController(loginUseCase, refreshTokenUseCase);

  /**
   * POST /api/auth/login
   * Authenticate user and return JWT tokens
   */
  router.post(
    '/login',
    loginRateLimiter,
    validate(loginSchema),
    (req, res) => authController.login(req, res)
  );

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  router.post(
    '/refresh',
    refreshRateLimiter,
    validate(refreshTokenSchema),
    (req, res) => authController.refresh(req, res)
  );

  return router;
}
