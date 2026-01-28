import { Router } from 'express';
import { OrganizationController } from '../controllers/OrganizationController.js';
import { OrganizationRepository } from '../../infrastructure/repositories/OrganizationRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { requireSuperAdmin, requireOrgAdmin, canManageOrganization } from '../middleware/authorize.js';

/**
 * Create and configure organization routes
 */
export function createOrganizationRoutes(): Router {
  const router = Router();
  
  // Apply authentication middleware to all routes
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  
  const organizationRepository = new OrganizationRepository();
  const organizationController = new OrganizationController(organizationRepository);
  
  // Super admin only routes
  router.get(
    '/',
    requireSuperAdmin,
    (req, res) => organizationController.getAllOrganizations(req, res)
  );
  
  router.post(
    '/',
    requireSuperAdmin,
    (req, res) => organizationController.createOrganization(req, res)
  );
  
  router.delete(
    '/:id',
    requireSuperAdmin,
    (req, res) => organizationController.deleteOrganization(req, res)
  );
  
  // Current user's organization (any authenticated user)
  router.get(
    '/me',
    requireTenant,
    (req, res) => organizationController.getMyOrganization(req, res)
  );
  
  // Organization details (super admin or org admin)
  router.get(
    '/:id',
    requireOrgAdmin,
    (req, res) => organizationController.getOrganization(req, res)
  );
  
  // Update organization (super admin or org admin for their own org)
  router.put(
    '/:id',
    requireOrgAdmin,
    canManageOrganization,
    (req, res) => organizationController.updateOrganization(req, res)
  );
  
  return router;
}
