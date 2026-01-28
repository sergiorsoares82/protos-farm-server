import type { Request, Response, NextFunction } from 'express';

export interface TenantContext {
  tenantId: string;
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

export const tenantContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Extract tenant from JWT (set by auth middleware)
  const user = (req as any).user;
  
  if (user && user.tenantId) {
    req.tenant = {
      tenantId: user.tenantId,
      userId: user.id || user.userId,
    };
  }
  
  next();
};

export const requireTenant = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.tenant) {
    res.status(403).json({
      success: false,
      error: 'No tenant context available',
    });
    return;
  }
  next();
};
