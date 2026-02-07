import { Router } from 'express';
import { RoleController } from '../controllers/RoleController.js';
import { GetAllRolesUseCase } from '../../application/use-cases/GetAllRolesUseCase.js';
import { CreateRoleUseCase } from '../../application/use-cases/CreateRoleUseCase.js';
import { UpdateRoleUseCase } from '../../application/use-cases/UpdateRoleUseCase.js';
import { DeleteRoleUseCase } from '../../application/use-cases/DeleteRoleUseCase.js';
import { GetRoleStatsUseCase } from '../../application/use-cases/GetRoleStatsUseCase.js';
import { RoleRepository } from '../../infrastructure/repositories/RoleRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { requireOrgAdmin } from '../middleware/authorize.js';

export function createRoleRoutes(): Router {
  const router = Router();

  // Initialize dependencies
  const roleRepository = new RoleRepository();

  // Initialize use cases
  const getAllRolesUseCase = new GetAllRolesUseCase(roleRepository);
  const createRoleUseCase = new CreateRoleUseCase(roleRepository);
  const updateRoleUseCase = new UpdateRoleUseCase(roleRepository);
  const deleteRoleUseCase = new DeleteRoleUseCase(roleRepository);
  const getRoleStatsUseCase = new GetRoleStatsUseCase(roleRepository);

  // Initialize controller
  const controller = new RoleController(
    getAllRolesUseCase,
    createRoleUseCase,
    updateRoleUseCase,
    deleteRoleUseCase,
    getRoleStatsUseCase
  );

  // Apply middleware to all routes
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  // Routes
  // GET /api/roles - Get all roles (ORG_ADMIN and above)
  router.get('/', requireOrgAdmin, controller.getAllRoles.bind(controller));

  // POST /api/roles - Create a new role (ORG_ADMIN and above)
  router.post('/', requireOrgAdmin, controller.createRole.bind(controller));

  // PUT /api/roles/:id - Update a role (ORG_ADMIN and above)
  router.put('/:id', requireOrgAdmin, controller.updateRole.bind(controller));

  // DELETE /api/roles/:id - Delete a role (ORG_ADMIN and above)
  router.delete('/:id', requireOrgAdmin, controller.deleteRole.bind(controller));

  // GET /api/roles/:id/stats - Get role stats (ORG_ADMIN and above)
  router.get('/:id/stats', requireOrgAdmin, controller.getRoleStats.bind(controller));

  return router;
}
