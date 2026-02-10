import type { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../domain/enums/UserRole.js';
import { EntityType } from '../../domain/enums/EntityType.js';
import { PermissionAction } from '../../domain/enums/PermissionAction.js';
import { PermissionService } from '../../application/services/PermissionService.js';
import { PermissionRepository } from '../../infrastructure/repositories/PermissionRepository.js';
import { RolePermissionRepository } from '../../infrastructure/repositories/RolePermissionRepository.js';

// Initialize permission service singleton
const permissionRepository = new PermissionRepository();
const rolePermissionRepository = new RolePermissionRepository();
export const permissionService = new PermissionService(permissionRepository, rolePermissionRepository);

/**
 * Middleware to check if user has one of the required roles
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }
    
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }
    
    next();
  };
};

/**
 * Middleware to require super admin role
 */
export const requireSuperAdmin = requireRole(UserRole.SUPER_ADMIN);

/**
 * Middleware to require org admin or super admin role
 */
export const requireOrgAdmin = requireRole(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN);

/**
 * Middleware to check if user can manage a specific organization
 */
export const canManageOrganization = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  const { id } = req.params;
  
  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }
  
  // Super admin can manage any organization
  if (user.role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }
  
  // Org admin can only manage their own organization
  if (user.role === UserRole.ORG_ADMIN && user.tenantId === id) {
    next();
    return;
  }
  
  res.status(403).json({
    success: false,
    error: 'Cannot manage this organization',
  });
};

/**
 * Middleware to check if user can manage a document type
 * Super admin can manage all (including system types)
 * Org admin can only manage their own organization's types (not system types)
 */
export const canManageDocumentType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;
  
  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }
  
  // Super admin can manage any document type
  if (user.role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }
  
  // For org admin, check if it's a system type or belongs to their organization
  if (user.role === UserRole.ORG_ADMIN) {
    const docTypeId = typeof id === 'string' ? id : undefined;
    if (!docTypeId) {
      res.status(400).json({ success: false, error: 'Invalid document type id' });
      return;
    }
    const { DocumentTypeRepository } = await import('../../infrastructure/repositories/DocumentTypeRepository.js');
    const repository = new DocumentTypeRepository();
    const docType = await repository.findById(docTypeId);
    
    if (!docType) {
      res.status(404).json({
        success: false,
        error: 'Document type not found',
      });
      return;
    }
    
    // Org admin cannot edit system types
    if (docType.getIsSystem()) {
      res.status(403).json({
        success: false,
        error: 'Cannot edit system document types',
      });
      return;
    }
    
    // Org admin can only edit their own organization's types
    if (docType.getTenantId() === user.tenantId) {
      next();
      return;
    }
    
    res.status(403).json({
      success: false,
      error: 'Cannot manage this document type',
    });
    return;
  }
  
  res.status(403).json({
    success: false,
    error: 'Insufficient permissions',
  });
};

/**
 * Middleware to check if user can manage an invoice financial type (update/delete).
 * Super admin can manage all (including system types).
 * Org admin can only manage their own organization's types (not system types).
 */
export const canManageInvoiceFinancialType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  if (user.role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }

  if (user.role === UserRole.ORG_ADMIN) {
    const typeId = typeof id === 'string' ? id : undefined;
    if (!typeId) {
      res.status(400).json({ success: false, error: 'Invalid invoice financial type id' });
      return;
    }
    const { InvoiceFinancialsTypeRepository } = await import('../../infrastructure/repositories/InvoiceFinancialsTypeRepository.js');
    const repository = new InvoiceFinancialsTypeRepository();
    const type = await repository.findByIdAny(typeId);

    if (!type) {
      res.status(404).json({
        success: false,
        error: 'Invoice financial type not found',
      });
      return;
    }

    if (type.getIsSystem()) {
      res.status(403).json({
        success: false,
        error: 'Cannot edit system invoice financial types',
      });
      return;
    }

    if (type.getTenantId() === user.tenantId) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: 'Cannot manage this invoice financial type',
    });
    return;
  }

  res.status(403).json({
    success: false,
    error: 'Insufficient permissions',
  });
};

/**
 * Middleware to check if user can manage an activity type (update/delete).
 * Super admin can manage all (including system types).
 * Org admin can only manage their own organization's types (not system types).
 */
export const canManageActivityType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  if (user.role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }

  if (user.role === UserRole.ORG_ADMIN) {
    const typeId = typeof id === 'string' ? id : undefined;
    if (!typeId) {
      res.status(400).json({ success: false, error: 'Invalid activity type id' });
      return;
    }
    const { ActivityTypeRepository } = await import('../../infrastructure/repositories/ActivityTypeRepository.js');
    const repository = new ActivityTypeRepository();
    const type = await repository.findByIdAny(typeId);

    if (!type) {
      res.status(404).json({
        success: false,
        error: 'Activity type not found',
      });
      return;
    }

    if (type.getIsSystem()) {
      res.status(403).json({
        success: false,
        error: 'Cannot edit system activity types',
      });
      return;
    }

    if (type.getTenantId() === user.tenantId) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: 'Cannot manage this activity type',
    });
    return;
  }

  res.status(403).json({
    success: false,
    error: 'Insufficient permissions',
  });
};

/**
 * Generic permission-based middleware
 * Checks if user has specific permission for an entity and action
 */
export const requirePermission = (entity: EntityType, action: PermissionAction) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const tenant = (req as any).tenant;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    try {
      const hasPermission = await permissionService.hasPermission(
        user.role,
        entity,
        action,
        tenant?.tenantId
      );

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          error: `Permission denied: ${entity}:${action}`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        error: 'Error checking permissions',
      });
    }
  };
};

/**
 * Helper middleware functions for common permission checks
 */
export const canViewEntity = (entity: EntityType) => requirePermission(entity, PermissionAction.VIEW);
export const canCreateEntity = (entity: EntityType) => requirePermission(entity, PermissionAction.CREATE);
export const canEditEntity = (entity: EntityType) => requirePermission(entity, PermissionAction.EDIT);
export const canDeleteEntity = (entity: EntityType) => requirePermission(entity, PermissionAction.DELETE);
