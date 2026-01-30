import { StockMovement } from '../../domain/entities/StockMovement.js';
import type { IStockMovementRepository } from '../../domain/repositories/IStockMovementRepository.js';
import type { IStockMovementTypeRepository } from '../../domain/repositories/IStockMovementTypeRepository.js';
import type { IItemRepository } from '../../domain/repositories/IItemRepository.js';
import type { IWorkLocationRepository } from '../../domain/repositories/IWorkLocationRepository.js';
import type { ISeasonRepository } from '../../domain/repositories/ISeasonRepository.js';
import type { ICostCenterRepository } from '../../domain/repositories/ICostCenterRepository.js';
import type { IManagementAccountRepository } from '../../domain/repositories/IManagementAccountRepository.js';
import type {
  CreateStockMovementDTO,
  UpdateStockMovementDTO,
} from '../dtos/StockMovementDTOs.js';

export class StockMovementService {
  constructor(
    private readonly stockMovementRepository: IStockMovementRepository,
    private readonly stockMovementTypeRepository: IStockMovementTypeRepository,
    private readonly itemRepository: IItemRepository,
    private readonly workLocationRepository?: IWorkLocationRepository,
    private readonly seasonRepository?: ISeasonRepository,
    private readonly costCenterRepository?: ICostCenterRepository,
    private readonly managementAccountRepository?: IManagementAccountRepository,
  ) {}

  async createMovement(tenantId: string, data: CreateStockMovementDTO): Promise<StockMovement> {
    await this.validateReferences(tenantId, {
      stockMovementTypeId: data.stockMovementTypeId,
      itemId: data.itemId,
      workLocationId: data.workLocationId ?? null,
      seasonId: data.seasonId ?? null,
      costCenterId: data.costCenterId ?? null,
      managementAccountId: data.managementAccountId ?? null,
    });

    const movementDate = new Date(data.movementDate);
    const movement = StockMovement.create(
      tenantId,
      movementDate,
      data.stockMovementTypeId,
      data.itemId,
      data.unit,
      data.quantity,
      data.workLocationId ?? null,
      data.seasonId ?? null,
      data.costCenterId ?? null,
      data.managementAccountId ?? null,
    );
    return this.stockMovementRepository.save(movement);
  }

  async getMovement(tenantId: string, id: string): Promise<StockMovement> {
    const movement = await this.stockMovementRepository.findById(id, tenantId);
    if (!movement) {
      throw new Error('Stock movement not found');
    }
    return movement;
  }

  async updateMovement(
    tenantId: string,
    id: string,
    data: UpdateStockMovementDTO,
  ): Promise<StockMovement> {
    const movement = await this.getMovement(tenantId, id);

    await this.validateReferences(tenantId, {
      stockMovementTypeId: data.stockMovementTypeId ?? movement.getStockMovementTypeId(),
      itemId: data.itemId ?? movement.getItemId(),
      workLocationId: data.workLocationId !== undefined ? data.workLocationId : movement.getWorkLocationId(),
      seasonId: data.seasonId !== undefined ? data.seasonId : movement.getSeasonId(),
      costCenterId: data.costCenterId !== undefined ? data.costCenterId : movement.getCostCenterId(),
      managementAccountId:
        data.managementAccountId !== undefined
          ? data.managementAccountId
          : movement.getManagementAccountId(),
    });

    const movementDate = data.movementDate
      ? new Date(data.movementDate)
      : movement.getMovementDate();
    movement.update(
      movementDate,
      data.stockMovementTypeId ?? movement.getStockMovementTypeId(),
      data.itemId ?? movement.getItemId(),
      data.unit ?? movement.getUnit(),
      data.quantity ?? movement.getQuantity(),
      data.workLocationId !== undefined ? data.workLocationId : movement.getWorkLocationId(),
      data.seasonId !== undefined ? data.seasonId : movement.getSeasonId(),
      data.costCenterId !== undefined ? data.costCenterId : movement.getCostCenterId(),
      data.managementAccountId !== undefined
        ? data.managementAccountId
        : movement.getManagementAccountId(),
    );
    return this.stockMovementRepository.save(movement);
  }

  async deleteMovement(tenantId: string, id: string): Promise<void> {
    await this.getMovement(tenantId, id);
    await this.stockMovementRepository.delete(id, tenantId);
  }

  async getAllMovements(tenantId: string): Promise<StockMovement[]> {
    return this.stockMovementRepository.findAll(tenantId);
  }

  private async validateReferences(
    tenantId: string,
    refs: {
      stockMovementTypeId: string;
      itemId: string;
      workLocationId: string | null;
      seasonId: string | null;
      costCenterId: string | null;
      managementAccountId: string | null;
    },
  ): Promise<void> {
    const type = await this.stockMovementTypeRepository.findById(
      refs.stockMovementTypeId,
      tenantId,
    );
    if (!type) {
      throw new Error('Stock movement type not found');
    }

    const item = await this.itemRepository.findById(refs.itemId, tenantId);
    if (!item) {
      throw new Error('Item (product) not found');
    }

    if (refs.workLocationId && this.workLocationRepository) {
      const wl = await this.workLocationRepository.findById(refs.workLocationId, tenantId);
      if (!wl) {
        throw new Error('Work location not found');
      }
    }

    if (refs.seasonId && this.seasonRepository) {
      const season = await this.seasonRepository.findById(refs.seasonId, tenantId);
      if (!season) {
        throw new Error('Season not found');
      }
    }

    if (refs.costCenterId && this.costCenterRepository) {
      const cc = await this.costCenterRepository.findById(refs.costCenterId, tenantId);
      if (!cc) {
        throw new Error('Cost center not found');
      }
    }

    if (refs.managementAccountId && this.managementAccountRepository) {
      const ma = await this.managementAccountRepository.findById(
        refs.managementAccountId,
        tenantId,
      );
      if (!ma) {
        throw new Error('Management account not found');
      }
    }
  }
}
