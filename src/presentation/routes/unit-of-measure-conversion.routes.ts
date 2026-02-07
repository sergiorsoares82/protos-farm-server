import { Router } from 'express';
import { UnitOfMeasureConversionController } from '../controllers/UnitOfMeasureConversionController.js';
import { UnitOfMeasureConversionService } from '../../application/services/UnitOfMeasureConversionService.js';
import { UnitOfMeasureConversionRepository } from '../../infrastructure/repositories/UnitOfMeasureConversionRepository.js';
import { UnitOfMeasureRepository } from '../../infrastructure/repositories/UnitOfMeasureRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { requireOrgAdmin, canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

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

  router.get('/', canViewEntity(EntityType.UNIT_OF_MEASURE_CONVERSION), (req, res) => conversionController.getAll(req, res));
  router.get('/:id', canViewEntity(EntityType.UNIT_OF_MEASURE_CONVERSION), (req, res) => conversionController.get(req, res));

  router.use(requireOrgAdmin);
  router.post('/', canCreateEntity(EntityType.UNIT_OF_MEASURE_CONVERSION), (req, res) => conversionController.create(req, res));
  router.put('/:id', canEditEntity(EntityType.UNIT_OF_MEASURE_CONVERSION), (req, res) => conversionController.update(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.UNIT_OF_MEASURE_CONVERSION), (req, res) => conversionController.delete(req, res));

  return router;
}
