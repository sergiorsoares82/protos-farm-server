import { Router } from 'express';
import { PermissionController } from '../controllers/PermissionController.js';
import { GetAllPermissionsUseCase } from '../../application/use-cases/GetAllPermissionsUseCase.js';
import { GetRolePermissionsUseCase } from '../../application/use-cases/GetRolePermissionsUseCase.js';
import { UpdateRolePermissionsUseCase } from '../../application/use-cases/UpdateRolePermissionsUseCase.js';
import { GetCustomRolePermissionsUseCase } from '../../application/use-cases/GetCustomRolePermissionsUseCase.js';
import { UpdateCustomRolePermissionsUseCase } from '../../application/use-cases/UpdateCustomRolePermissionsUseCase.js';
import { CheckPermissionUseCase } from '../../application/use-cases/CheckPermissionUseCase.js';
import { PermissionRepository } from '../../infrastructure/repositories/PermissionRepository.js';
import { RolePermissionRepository } from '../../infrastructure/repositories/RolePermissionRepository.js';
import { RoleRepository } from '../../infrastructure/repositories/RoleRepository.js';
import { PermissionService } from '../../application/services/PermissionService.js';
import { authenticate } from '../middleware/auth.js';
import { requireOrgAdmin } from '../middleware/authorize.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

export function createPermissionRoutes(): Router {
  const router = Router();

  const permissionRepository = new PermissionRepository();
  const rolePermissionRepository = new RolePermissionRepository();
  const roleRepository = new RoleRepository();
  const permissionService = new PermissionService(permissionRepository, rolePermissionRepository);

  const getAllPermissionsUseCase = new GetAllPermissionsUseCase(permissionRepository);
  const getRolePermissionsUseCase = new GetRolePermissionsUseCase(permissionService);
  const updateRolePermissionsUseCase = new UpdateRolePermissionsUseCase(
    rolePermissionRepository,
    permissionRepository,
    permissionService
  );
  const getCustomRolePermissionsUseCase = new GetCustomRolePermissionsUseCase(permissionService);
  const updateCustomRolePermissionsUseCase = new UpdateCustomRolePermissionsUseCase(
    rolePermissionRepository,
    permissionRepository,
    roleRepository
  );
  const checkPermissionUseCase = new CheckPermissionUseCase(permissionService);

  const controller = new PermissionController(
    getAllPermissionsUseCase,
    getRolePermissionsUseCase,
    updateRolePermissionsUseCase,
    getCustomRolePermissionsUseCase,
    updateCustomRolePermissionsUseCase,
    checkPermissionUseCase
  );

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', requireOrgAdmin, controller.getAllPermissions.bind(controller));

  // Custom role permissions (must be before /roles/:role so "custom" is not matched as :role)
  router.get(
    '/roles/custom/:roleId',
    requireOrgAdmin,
    controller.getCustomRolePermissions.bind(controller)
  );
  router.put(
    '/roles/custom/:roleId',
    requireOrgAdmin,
    controller.updateCustomRolePermissions.bind(controller)
  );

  router.get('/roles/:role', requireOrgAdmin, controller.getRolePermissions.bind(controller));
  router.put('/roles/:role', requireOrgAdmin, controller.updateRolePermissions.bind(controller));

  router.get('/check', controller.checkPermission.bind(controller));

  return router;
}
