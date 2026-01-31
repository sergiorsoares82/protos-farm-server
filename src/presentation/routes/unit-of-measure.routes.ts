import { Router } from 'express';
import { UnitOfMeasureController } from '../controllers/UnitOfMeasureController.js';
import { UnitOfMeasureService } from '../../application/services/UnitOfMeasureService.js';
import { UnitOfMeasureRepository } from '../../infrastructure/repositories/UnitOfMeasureRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { requireOrgAdmin } from '../middleware/authorize.js';

/**
 * Unidade de medida: SuperAdmin edita registros de sistema (todas as orgs) e de qualquer org.
 * OrgAdmin edita apenas registros da própria organização.
 */
export function createUnitOfMeasureRoutes(): Router {
  const router = Router();

  const unitOfMeasureRepository = new UnitOfMeasureRepository();
  const unitOfMeasureService = new UnitOfMeasureService(unitOfMeasureRepository);
  const unitOfMeasureController = new UnitOfMeasureController(unitOfMeasureService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', (req, res) => unitOfMeasureController.getAll(req, res));
  router.get('/:id', (req, res) => unitOfMeasureController.get(req, res));

  router.use(requireOrgAdmin);
  router.post('/', (req, res) => unitOfMeasureController.create(req, res));
  router.put('/:id', (req, res) => unitOfMeasureController.update(req, res));
  router.delete('/:id', (req, res) => unitOfMeasureController.delete(req, res));

  return router;
}
