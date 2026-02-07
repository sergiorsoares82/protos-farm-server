import { Router } from 'express';
import { UserManagementController } from '../controllers/UserManagementController.js';
import { UserRepository } from '../../infrastructure/repositories/UserRepository.js';
import { PersonRepository } from '../../infrastructure/repositories/PersonRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware } from '../../infrastructure/middleware/tenantContext.js';
import { requireOrgAdmin, canViewEntity, canEditEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

/**
 * Create and configure user management routes
 */
export function createUserRoutes(): Router {
  const router = Router();
  
  // Apply authentication middleware to all routes
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  
  // Require org admin or super admin for all user management
  router.use(requireOrgAdmin);
  
  const userRepository = new UserRepository();
  const personRepository = new PersonRepository();
  const userManagementController = new UserManagementController(userRepository, personRepository);
  
  // Get all users (filtered by tenant based on role)
  router.get(
    '/',
    canViewEntity(EntityType.USER),
    (req, res) => userManagementController.getUsers(req, res)
  );
  
  // Get user by ID
  router.get(
    '/:id',
    canViewEntity(EntityType.USER),
    (req, res) => userManagementController.getUser(req, res)
  );
  
  // Create new user - Keep requireOrgAdmin for additional validation in controller
  router.post(
    '/',
    (req, res) => userManagementController.createUser(req, res)
  );
  
  // Update user
  router.put(
    '/:id',
    canEditEntity(EntityType.USER),
    (req, res) => userManagementController.updateUser(req, res)
  );
  
  // Delete user - Keep requireOrgAdmin for additional validation in controller
  router.delete(
    '/:id',
    (req, res) => userManagementController.deleteUser(req, res)
  );
  
  // Link person to user
  router.post(
    '/:id/link-person',
    canEditEntity(EntityType.USER),
    (req, res) => userManagementController.linkPerson(req, res)
  );
  
  // Unlink person from user
  router.delete(
    '/:userId/persons/:personId',
    canEditEntity(EntityType.USER),
    (req, res) => userManagementController.unlinkPerson(req, res)
  );
  
  return router;
}
