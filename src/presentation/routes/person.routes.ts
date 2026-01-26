import { Router } from 'express';
import { PersonController } from '../controllers/PersonController.js';
import { PersonRepository } from '../../infrastructure/repositories/PersonRepository.js';
import { validate, createPersonSchema, updatePersonSchema, assignRoleSchema } from '../middleware/validation.js';

/**
 * Create and configure person routes
 */
export function createPersonRoutes(): Router {
  const router = Router();
  const personRepository = new PersonRepository();
  const personController = new PersonController(personRepository);

  /**
   * POST /api/persons
   * Create a new person with roles
   */
  router.post(
    '/',
    validate(createPersonSchema),
    (req, res) => personController.createPerson(req, res)
  );

  /**
   * GET /api/persons/:id
   * Get person by ID with all roles
   */
  router.get(
    '/:id',
    (req, res) => personController.getPerson(req, res)
  );

  /**
   * PUT /api/persons/:id
   * Update person basic information
   */
  router.put(
    '/:id',
    validate(updatePersonSchema),
    (req, res) => personController.updatePerson(req, res)
  );

  /**
   * POST /api/persons/:id/roles
   * Assign a new role to a person
   */
  router.post(
    '/:id/roles',
    validate(assignRoleSchema),
    (req, res) => personController.assignRole(req, res)
  );

  /**
   * DELETE /api/persons/:id/roles/:role
   * Remove a role from a person
   */
  router.delete(
    '/:id/roles/:role',
    (req, res) => personController.removeRole(req, res)
  );

  /**
   * DELETE /api/persons/:id
   * Delete a person (not yet implemented)
   */
  router.delete(
    '/:id',
    (req, res) => personController.deletePerson(req, res)
  );

  return router;
}
