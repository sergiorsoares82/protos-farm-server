import { Router } from 'express';
import { PersonController } from '../controllers/PersonController.js';
import { PersonRepository } from '../../infrastructure/repositories/PersonRepository.js';
import { validate, createPersonSchema, updatePersonSchema, assignRoleSchema } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

/**
 * Create and configure person routes
 */
export function createPersonRoutes(): Router {
  const router = Router();
  
  // Apply authentication and tenant middleware to all person routes
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);
  
  const personRepository = new PersonRepository();
  const personController = new PersonController(personRepository);

  const wrap = (fn: (req: any, res: any) => Promise<void>) => (req: any, res: any, next: any) =>
    fn(req, res).catch(next);

  /**
   * GET /api/persons
   * Get all persons
   */
  router.get('/', wrap((req, res) => personController.getAllPersons(req, res)));

  /**
   * POST /api/persons
   * Create a new person with roles
   */
  router.post(
    '/',
    validate(createPersonSchema),
    wrap((req, res) => personController.createPerson(req, res))
  );

  /**
   * GET /api/persons/:id
   * Get person by ID with all roles
   */
  router.get('/:id', wrap((req, res) => personController.getPerson(req, res)));

  /**
   * PUT /api/persons/:id
   * Update person basic information
   */
  router.put(
    '/:id',
    validate(updatePersonSchema),
    wrap((req, res) => personController.updatePerson(req, res))
  );

  /**
   * POST /api/persons/:id/roles
   * Assign a new role to a person
   */
  router.post(
    '/:id/roles',
    validate(assignRoleSchema),
    wrap((req, res) => personController.assignRole(req, res))
  );

  /**
   * DELETE /api/persons/:id/roles/:role
   * Remove a role from a person
   */
  router.delete(
    '/:id/roles/:role',
    wrap((req, res) => personController.removeRole(req, res))
  );

  /**
   * DELETE /api/persons/:id
   * Delete a person (not yet implemented)
   */
  router.delete('/:id', wrap((req, res) => personController.deletePerson(req, res)));

  return router;
}
