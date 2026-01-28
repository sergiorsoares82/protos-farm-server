import type { Request, Response } from 'express';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase.js';
import { RefreshTokenUseCase } from '../../application/use-cases/RefreshTokenUseCase.js';
import type { LoginRequestDTO, RefreshTokenRequestDTO } from '../../application/dtos/AuthDTOs.js';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  /**
   * Handle login request
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const request: LoginRequestDTO = req.body;
      const response = await this.loginUseCase.execute(request);

      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Handle refresh token request
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const request: RefreshTokenRequestDTO = req.body;
      const response = await this.refreshTokenUseCase.execute(request);

      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Handle logout request
   * POST /api/auth/logout
   * 
   * Note: With JWT-based authentication, logout is primarily handled client-side
   * by removing tokens from storage. This endpoint acknowledges the logout.
   * In the future, this could be extended to:
   * - Invalidate refresh tokens in a database
   * - Add tokens to a blacklist
   * - Track user sessions
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Optional: Extract token from Authorization header for future blacklisting
      // const authHeader = req.headers.authorization;
      // const token = authHeader?.split(' ')[1];

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Centralized error handling
   */
  private handleError(error: unknown, res: Response): void {
    console.error('Controller error:', error);

    if (error instanceof Error) {
      // Authentication errors
      if (error.message === 'Invalid credentials') {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
          statusCode: 401,
        });
        return;
      }

      // Token errors
      if (
        error.message.includes('token') ||
        error.message.includes('expired') ||
        error.message.includes('Invalid')
      ) {
        res.status(401).json({
          error: 'Unauthorized',
          message: error.message,
          statusCode: 401,
        });
        return;
      }

      // Domain validation errors
      if (
        error.message.includes('Email') ||
        error.message.includes('Password') ||
        error.message.includes('validation')
      ) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
          statusCode: 400,
        });
        return;
      }
    }

    // Generic server error
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  }
}
