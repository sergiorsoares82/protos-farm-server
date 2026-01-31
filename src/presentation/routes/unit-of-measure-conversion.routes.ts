import { Router } from 'express';
import { UnitOfMeasureConversionController } from '../controllers/UnitOfMeasureConversionController.js';
import { UnitOfMeasureConversionService } from '../../application/services/UnitOfMeasureConversionService.js';
import { UnitOfMeasureConversionRepository } from '../../infrastructure/repositories/UnitOfMeasureConversionRepository.js';
import { UnitOfMeasureRepository } from '../../infrastructure/repositories/UnitOfMeasureRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { requireOrgAdmin } from '../middleware/authorize.js';

/**
 * Conversão de unidade de medida (ex.: 1 T = 1000 KG).
 * SuperAdmin edita conversões de sistema e de qualquer org; OrgAdmin apenas da própria org.
 */
export function createUnitOfMeasureConversionRoutes(): Router {
  const router = Router();

  const conversionRepository = new UnitOfMeasureConversionRepository();
  const unitOfMeasureRepository = new UnitOfMeasureRepository();
  const conversionService = new UnitOfMeasureConversionService(
    conversionRepository,
    unitOfMeasureRepository,
  );
  const conversionController = new UnitOfMeasureConversionController(conversionService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', (req, res) => conversionController.getAll(req, res));
  router.get('/:id', (req, res) => conversionController.get(req, res));

  router.use(requireOrgAdmin);
  router.post('/', (req, res) => conversionController.create(req, res));
  router.put('/:id', (req, res) => conversionController.update(req, res));
  router.delete('/:id', (req, res) => conversionController.delete(req, res));

  return router;
}
