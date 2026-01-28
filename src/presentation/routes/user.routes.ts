import { Router } from 'express';
import { UserManagementController } from '../controllers/UserManagementController.js';
import { UserRepository } from '../../infrastructure/repositories/UserRepository.js';
import { PersonRepository } from '../../infrastructure/repositories/PersonRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware } from '../../infrastructure/middleware/tenantContext.js';
import { requireOrgAdmin } from '../middleware/authorize.js';

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
    (req, res) => userManagementController.getUsers(req, res)
  );
  
  // Get user by ID
  router.get(
    '/:id',
    (req, res) => userManagementController.getUser(req, res)
  );
  
  // Create new user
  router.post(
    '/',
    (req, res) => userManagementController.createUser(req, res)
  );
  
  // Update user
  router.put(
    '/:id',
    (req, res) => userManagementController.updateUser(req, res)
  );
  
  // Delete user
  router.delete(
    '/:id',
    (req, res) => userManagementController.deleteUser(req, res)
  );
  
  // Link person to user
  router.post(
    '/:id/link-person',
    (req, res) => userManagementController.linkPerson(req, res)
  );
  
  // Unlink person from user
  router.delete(
    '/:userId/persons/:personId',
    (req, res) => userManagementController.unlinkPerson(req, res)
  );
  
  return router;
}
