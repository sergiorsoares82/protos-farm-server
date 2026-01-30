import { Repository } from 'typeorm';
import type { IStockMovementRepository } from '../../domain/repositories/IStockMovementRepository.js';
import { StockMovement } from '../../domain/entities/StockMovement.js';
import { StockMovementEntity } from '../database/entities/StockMovementEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class StockMovementRepository implements IStockMovementRepository {
  private repo: Repository<StockMovementEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(StockMovementEntity);
  }

  async findAll(tenantId: string): Promise<StockMovement[]> {
    const entities = await this.repo.find({
      where: { tenantId },
      order: { movementDate: 'DESC', createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<StockMovement | null> {
    const entity = await this.repo.findOne({
      where: { id, tenantId },
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async save(movement: StockMovement): Promise<StockMovement> {
    const entity = new StockMovementEntity();
    entity.id = movement.getId();
    entity.tenantId = movement.getTenantId();
    entity.movementDate = movement.getMovementDate().toISOString().slice(0, 10);
    entity.stockMovementTypeId = movement.getStockMovementTypeId();
    entity.itemId = movement.getItemId();
    entity.unit = movement.getUnit();
    entity.quantity = Number(movement.getQuantity());
    entity.workLocationId = movement.getWorkLocationId();
    entity.seasonId = movement.getSeasonId();
    entity.costCenterId = movement.getCostCenterId();
    entity.managementAccountId = movement.getManagementAccountId();

    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  private toDomain(entity: StockMovementEntity): StockMovement {
    return new StockMovement({
      id: entity.id,
      tenantId: entity.tenantId,
      movementDate: new Date(entity.movementDate),
      stockMovementTypeId: entity.stockMovementTypeId,
      itemId: entity.itemId,
      unit: entity.unit,
      quantity: Number(entity.quantity),
      workLocationId: entity.workLocationId,
      seasonId: entity.seasonId,
      costCenterId: entity.costCenterId,
      managementAccountId: entity.managementAccountId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
