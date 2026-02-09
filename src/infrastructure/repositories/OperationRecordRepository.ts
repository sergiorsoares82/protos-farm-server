import { Repository } from 'typeorm';
import type { IOperationRecordRepository } from '../../domain/repositories/IOperationRecordRepository.js';
import { 
  OperationRecord,
  OperationRecordWorker,
  OperationRecordProduct,
} from '../../domain/entities/OperationRecord.js';
import { OperationRecordEntity } from '../database/entities/OperationRecordEntity.js';
import { OperationRecordWorkerEntity } from '../database/entities/OperationRecordWorkerEntity.js';
import { OperationRecordProductEntity } from '../database/entities/OperationRecordProductEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class OperationRecordRepository implements IOperationRecordRepository {
  private repo: Repository<OperationRecordEntity>;
  private workerRepo: Repository<OperationRecordWorkerEntity>;
  private productRepo: Repository<OperationRecordProductEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(OperationRecordEntity);
    this.workerRepo = AppDataSource.getRepository(OperationRecordWorkerEntity);
    this.productRepo = AppDataSource.getRepository(OperationRecordProductEntity);
  }

  async findAll(tenantId: string): Promise<OperationRecord[]> {
    const entities = await this.repo.find({
      where: { tenantId },
      relations: ['workers', 'products', 'operation', 'machine', 'field', 'costCenter', 'implement'],
      order: { serviceDate: 'DESC', createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<OperationRecord | null> {
    const entity = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['workers', 'products'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(operationRecord: OperationRecord): Promise<OperationRecord> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Save main entity
      const entity = new OperationRecordEntity();
      (entity as any).id = operationRecord.getId();
      entity.tenantId = operationRecord.getTenantId();
      entity.serviceDate = operationRecord.getServiceDate();
      entity.seasonId = operationRecord.getSeasonId();
      entity.operationId = operationRecord.getOperationId();
      entity.machineId = operationRecord.getMachineId();
      entity.horimeterStart = operationRecord.getHorimeterStart();
      entity.horimeterEnd = operationRecord.getHorimeterEnd();
      entity.implementId = operationRecord.getImplementId() ?? null;
      entity.fieldId = operationRecord.getFieldId();
      entity.costCenterId = operationRecord.getCostCenterId();
      entity.notes = operationRecord.getNotes() ?? null;
      entity.isActive = operationRecord.getIsActive();

      const savedEntity = await queryRunner.manager.save(OperationRecordEntity, entity);

      // Delete existing workers and products
      await queryRunner.manager.delete(OperationRecordWorkerEntity, { operationRecordId: savedEntity.id });
      await queryRunner.manager.delete(OperationRecordProductEntity, { operationRecordId: savedEntity.id });

      // Save workers
      const workers = operationRecord.getWorkers();
      for (const worker of workers) {
        const workerEntity = new OperationRecordWorkerEntity();
        (workerEntity as any).id = worker.getId();
        workerEntity.operationRecordId = savedEntity.id;
        workerEntity.workerId = worker.getWorkerId();
        workerEntity.startTime = worker.getStartTime();
        workerEntity.endTime = worker.getEndTime();
        await queryRunner.manager.save(OperationRecordWorkerEntity, workerEntity);
      }

      // Save products
      const products = operationRecord.getProducts();
      for (const product of products) {
        const productEntity = new OperationRecordProductEntity();
        (productEntity as any).id = product.getId();
        productEntity.operationRecordId = savedEntity.id;
        productEntity.productId = product.getProductId();
        productEntity.quantity = product.getQuantity();
        productEntity.unitOfMeasureId = product.getUnitOfMeasureId();
        await queryRunner.manager.save(OperationRecordProductEntity, productEntity);
      }

      await queryRunner.commitTransaction();

      // Reload with relations
      const reloaded = await this.repo.findOne({
        where: { id: savedEntity.id, tenantId: savedEntity.tenantId },
        relations: ['workers', 'products'],
      });

      return this.toDomain(reloaded!);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  private toDomain(entity: OperationRecordEntity): OperationRecord {
    return new OperationRecord({
      id: entity.id,
      tenantId: entity.tenantId,
      serviceDate: entity.serviceDate,
      seasonId: entity.seasonId,
      operationId: entity.operationId,
      machineId: entity.machineId,
      horimeterStart: Number(entity.horimeterStart),
      horimeterEnd: Number(entity.horimeterEnd),
      implementId: entity.implementId ?? null,
      fieldId: entity.fieldId,
      costCenterId: entity.costCenterId,
      notes: entity.notes ?? null,
      workers: (entity.workers || []).map((w) => ({
        id: w.id,
        workerId: w.workerId,
        startTime: w.startTime,
        endTime: w.endTime,
      })),
      products: (entity.products || []).map((p) => ({
        id: p.id,
        productId: p.productId,
        quantity: Number(p.quantity),
        unitOfMeasureId: p.unitOfMeasureId,
      })),
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
