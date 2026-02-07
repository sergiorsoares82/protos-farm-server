import { Router } from 'express';
import { PermissionController } from '../controllers/PermissionController.js';
import { GetAllPermissionsUseCase } from '../../application/use-cases/GetAllPermissionsUseCase.js';
import { GetRolePermissionsUseCase } from '../../application/use-cases/GetRolePermissionsUseCase.js';
import { UpdateRolePermissionsUseCase } from '../../application/use-cases/UpdateRolePermissionsUseCase.js';
import { CheckPermissionUseCase } from '../../application/use-cases/CheckPermissionUseCase.js';
import { PermissionRepository } from '../../infrastructure/repositories/PermissionRepository.js';
import { RolePermissionRepository } from '../../infrastructure/repositories/RolePermissionRepository.js';
import { PermissionService } from '../../application/services/PermissionService.js';
import { authenticate } from '../middleware/auth.js';
import { requireSuperAdmin, requireOrgAdmin } from '../middleware/authorize.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

export function createPermissionRoutes(): Router {
  const router = Router();

  // Initialize dependencies
  const permissionRepository = new PermissionRepository();
  const rolePermissionRepository = new RolePermissionRepository();
  const permissionService = new PermissionService(permissionRepository, rolePermissionRepository);

  // Initialize use cases
  const getAllPermissionsUseCase = new GetAllPermissionsUseCase(permissionRepository);
  const getRolePermissionsUseCase = new GetRolePermissionsUseCase(permissionService);
  const updateRolePermissionsUseCase = new UpdateRolePermissionsUseCase(
    rolePermissionRepository,
    permissionRepository,
    permissionService
  );
  const checkPermissionUseCase = new CheckPermissionUseCase(permissionService);

  // Initialize controller
  const controller = new PermissionController(
    getAllPermissionsUseCase,
    getRolePermissionsUseCase,
    updateRolePermissionsUseCase,
    checkPermissionUseCase
  );

  // Apply middleware to all routes
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  // Routes
  // GET /api/permissions - Get all permissions (ORG_ADMIN and above)
  router.get('/', requireOrgAdmin, controller.getAllPermissions.bind(controller));

  // GET /api/permissions/roles/:role - Get permissions for a role (ORG_ADMIN and above)
  router.get('/roles/:role', requireOrgAdmin, controller.getRolePermissions.bind(controller));

  // PUT /api/permissions/roles/:role - Update permissions for a role (ORG_ADMIN and above, with restrictions)
  router.put('/roles/:role', requireOrgAdmin, controller.updateRolePermissions.bind(controller));

  // GET /api/permissions/check - Check if user has specific permission (any authenticated user)
  router.get('/check', controller.checkPermission.bind(controller));

  return router;
}
