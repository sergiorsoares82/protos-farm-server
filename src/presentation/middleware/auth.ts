import type { Request, Response, NextFunction } from 'express';
import { JWTService } from '../../application/services/JWTService.js';

const jwtService = new JWTService();

import { UserRole } from '../../domain/enums/UserRole.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        tenantId: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
      return;
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Invalid authorization header format',
      });
      return;
    }
    
    // Verify and decode token
    const payload = jwtService.verifyAccessToken(token);
    
    // Attach user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
    };
    
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    res.status(401).json({
      success: false,
      error: errorMessage,
    });
  }
};
