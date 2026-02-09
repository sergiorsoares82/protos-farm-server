import { 
  OperationRecord, 
  OperationRecordWorker,
  OperationRecordProduct,
} from '../../domain/entities/OperationRecord.js';
import type { IOperationRecordRepository } from '../../domain/repositories/IOperationRecordRepository.js';
import type { ISeasonRepository } from '../../domain/repositories/ISeasonRepository.js';
import type { IOperationRepository } from '../../domain/repositories/IOperationRepository.js';
import type { IMachineRepository } from '../../domain/repositories/IMachineRepository.js';
import type { IAssetRepository } from '../../domain/repositories/IAssetRepository.js';
import type { IFieldRepository } from '../../domain/repositories/IFieldRepository.js';
import type { ICostCenterRepository } from '../../domain/repositories/ICostCenterRepository.js';
import type { IItemRepository } from '../../domain/repositories/IItemRepository.js';
import { AssetKind } from '../../domain/enums/AssetKind.js';
import { ItemType } from '../../domain/enums/ItemType.js';
import type { CreateOperationRecordDTO, UpdateOperationRecordDTO } from '../dtos/OperationRecordDTOs.js';
import { AppDataSource } from '../../infrastructure/database/typeorm.config.js';
import { WorkerEntity } from '../../infrastructure/database/entities/WorkerEntity.js';
import { UnitOfMeasureEntity } from '../../infrastructure/database/entities/UnitOfMeasureEntity.js';
import { Repository } from 'typeorm';

export class OperationRecordService {
  private workerRepo: Repository<WorkerEntity>;
  private unitOfMeasureRepo: Repository<UnitOfMeasureEntity>;

  constructor(
    private readonly operationRecordRepository: IOperationRecordRepository,
    private readonly seasonRepository: ISeasonRepository,
    private readonly operationRepository: IOperationRepository,
    private readonly machineRepository: IMachineRepository,
    private readonly assetRepository: IAssetRepository,
    private readonly fieldRepository: IFieldRepository,
    private readonly costCenterRepository: ICostCenterRepository,
    private readonly itemRepository: IItemRepository,
  ) {
    this.workerRepo = AppDataSource.getRepository(WorkerEntity);
    this.unitOfMeasureRepo = AppDataSource.getRepository(UnitOfMeasureEntity);
  }

  async createOperationRecord(tenantId: string, data: CreateOperationRecordDTO): Promise<OperationRecord> {
    // Validate season if provided
    if (data.seasonId) {
      const season = await this.seasonRepository.findById(data.seasonId, tenantId);
      if (!season) {
        throw new Error('Season not found');
      }
      if (!season.getIsActive()) {
        throw new Error('Season is not active');
      }
    }

    // Validate operation exists
    const operation = await this.operationRepository.findById(data.operationId, tenantId);
    if (!operation) {
      throw new Error('Operation not found');
    }
    if (!operation.getIsActive()) {
      throw new Error('Operation is not active');
    }

    // Validate machine exists
    const machine = await this.machineRepository.findById(data.machineId, tenantId);
    if (!machine) {
      throw new Error('Machine not found');
    }
    if (!machine.getIsActive()) {
      throw new Error('Machine is not active');
    }

    // Validate field exists
    const field = await this.fieldRepository.findById(data.fieldId, tenantId);
    if (!field) {
      throw new Error('Field not found');
    }
    if (!field.getIsActive()) {
      throw new Error('Field is not active');
    }

    // Validate cost center exists
    const costCenter = await this.costCenterRepository.findById(data.costCenterId, tenantId);
    if (!costCenter) {
      throw new Error('Cost center not found');
    }
    if (!costCenter.getIsActive()) {
      throw new Error('Cost center is not active');
    }

    // Validate implement if provided
    if (data.implementId) {
      const implement = await this.assetRepository.findById(data.implementId, tenantId);
      if (!implement) {
        throw new Error('Implement not found');
      }
      if (implement.getAssetKind() !== AssetKind.IMPLEMENT) {
        throw new Error('Asset must be of kind IMPLEMENT');
      }
      if (!implement.getIsActive()) {
        throw new Error('Implement is not active');
      }
    }

    // Validate workers exist
    for (const workerDTO of data.workers) {
      const worker = await this.workerRepo.findOne({ 
        where: { id: workerDTO.workerId, tenantId } 
      });
      if (!worker) {
        throw new Error(`Worker ${workerDTO.workerId} not found`);
      }
    }

    // Validate products exist and are of type PRODUCT
    for (const productDTO of data.products) {
      const product = await this.itemRepository.findById(productDTO.productId, tenantId);
      if (!product) {
        throw new Error(`Product ${productDTO.productId} not found`);
      }
      if (product.getType() !== ItemType.PRODUCT) {
        throw new Error(`Item ${productDTO.productId} is not a product`);
      }
      if (!product.getIsActive()) {
        throw new Error(`Product ${productDTO.productId} is not active`);
      }

      // Validate unit of measure
      const unitOfMeasure = await this.unitOfMeasureRepo.findOne({
        where: { id: productDTO.unitOfMeasureId }
      });
      if (!unitOfMeasure) {
        throw new Error(`Unit of measure ${productDTO.unitOfMeasureId} not found`);
      }
    }

    // Create operation record
    const operationRecord = OperationRecord.create(
      tenantId,
      new Date(data.serviceDate),
      data.seasonId,
      data.operationId,
      data.machineId,
      data.horimeterStart,
      data.horimeterEnd,
      data.fieldId,
      data.costCenterId,
      data.implementId,
      data.notes,
    );

    // Add workers
    const workers = data.workers.map(w => 
      OperationRecordWorker.create(w.workerId, w.startTime, w.endTime)
    );
    operationRecord.setWorkers(workers);

    // Add products
    const products = data.products.map(p =>
      OperationRecordProduct.create(p.productId, p.quantity, p.unitOfMeasureId)
    );
    operationRecord.setProducts(products);

    return this.operationRecordRepository.save(operationRecord);
  }

  async getOperationRecord(tenantId: string, id: string): Promise<OperationRecord> {
    const operationRecord = await this.operationRecordRepository.findById(id, tenantId);
    if (!operationRecord) {
      throw new Error('Operation record not found');
    }
    return operationRecord;
  }

  async updateOperationRecord(
    tenantId: string,
    id: string,
    data: UpdateOperationRecordDTO
  ): Promise<OperationRecord> {
    const operationRecord = await this.getOperationRecord(tenantId, id);

    // Validate season if provided
    if (data.seasonId) {
      const season = await this.seasonRepository.findById(data.seasonId, tenantId);
      if (!season) {
        throw new Error('Season not found');
      }
      if (!season.getIsActive()) {
        throw new Error('Season is not active');
      }
    }

    // Validate operation if provided
    if (data.operationId) {
      const operation = await this.operationRepository.findById(data.operationId, tenantId);
      if (!operation) {
        throw new Error('Operation not found');
      }
      if (!operation.getIsActive()) {
        throw new Error('Operation is not active');
      }
    }

    // Validate machine if provided
    if (data.machineId) {
      const machine = await this.machineRepository.findById(data.machineId, tenantId);
      if (!machine) {
        throw new Error('Machine not found');
      }
      if (!machine.getIsActive()) {
        throw new Error('Machine is not active');
      }
    }

    // Validate field if provided
    if (data.fieldId) {
      const field = await this.fieldRepository.findById(data.fieldId, tenantId);
      if (!field) {
        throw new Error('Field not found');
      }
      if (!field.getIsActive()) {
        throw new Error('Field is not active');
      }
    }

    // Validate cost center if provided
    if (data.costCenterId) {
      const costCenter = await this.costCenterRepository.findById(data.costCenterId, tenantId);
      if (!costCenter) {
        throw new Error('Cost center not found');
      }
      if (!costCenter.getIsActive()) {
        throw new Error('Cost center is not active');
      }
    }

    // Validate implement if provided
    if (data.implementId !== undefined) {
      if (data.implementId) {
        const implement = await this.assetRepository.findById(data.implementId, tenantId);
        if (!implement) {
          throw new Error('Implement not found');
        }
        if (implement.getAssetKind() !== AssetKind.IMPLEMENT) {
          throw new Error('Asset must be of kind IMPLEMENT');
        }
        if (!implement.getIsActive()) {
          throw new Error('Implement is not active');
        }
      }
    }

    // Validate workers if provided
    if (data.workers) {
      for (const workerDTO of data.workers) {
        const worker = await this.workerRepo.findOne({ 
          where: { id: workerDTO.workerId, tenantId } 
        });
        if (!worker) {
          throw new Error(`Worker ${workerDTO.workerId} not found`);
        }
      }
    }

    // Validate products if provided
    if (data.products) {
      for (const productDTO of data.products) {
        const product = await this.itemRepository.findById(productDTO.productId, tenantId);
        if (!product) {
          throw new Error(`Product ${productDTO.productId} not found`);
        }
        if (product.getType() !== ItemType.PRODUCT) {
          throw new Error(`Item ${productDTO.productId} is not a product`);
        }
        if (!product.getIsActive()) {
          throw new Error(`Product ${productDTO.productId} is not active`);
        }

        // Validate unit of measure
        const unitOfMeasure = await this.unitOfMeasureRepo.findOne({
          where: { id: productDTO.unitOfMeasureId }
        });
        if (!unitOfMeasure) {
          throw new Error(`Unit of measure ${productDTO.unitOfMeasureId} not found`);
        }
      }
    }

    // Update main fields
    if (
      data.serviceDate !== undefined ||
      data.seasonId !== undefined ||
      data.operationId !== undefined ||
      data.machineId !== undefined ||
      data.horimeterStart !== undefined ||
      data.horimeterEnd !== undefined ||
      data.fieldId !== undefined ||
      data.costCenterId !== undefined ||
      data.implementId !== undefined ||
      data.notes !== undefined
    ) {
      operationRecord.update(
        data.serviceDate ? new Date(data.serviceDate) : operationRecord.getServiceDate(),
        data.seasonId ?? operationRecord.getSeasonId(),
        data.operationId ?? operationRecord.getOperationId(),
        data.machineId ?? operationRecord.getMachineId(),
        data.horimeterStart ?? operationRecord.getHorimeterStart(),
        data.horimeterEnd ?? operationRecord.getHorimeterEnd(),
        data.fieldId ?? operationRecord.getFieldId(),
        data.costCenterId ?? operationRecord.getCostCenterId(),
        data.implementId !== undefined ? data.implementId : operationRecord.getImplementId(),
        data.notes !== undefined ? data.notes : operationRecord.getNotes(),
      );
    }

    // Update workers if provided
    if (data.workers) {
      const workers = data.workers.map(w => 
        OperationRecordWorker.create(w.workerId, w.startTime, w.endTime)
      );
      operationRecord.setWorkers(workers);
    }

    // Update products if provided
    if (data.products) {
      const products = data.products.map(p =>
        OperationRecordProduct.create(p.productId, p.quantity, p.unitOfMeasureId)
      );
      operationRecord.setProducts(products);
    }

    // Update isActive if provided
    if (data.isActive !== undefined) {
      if (data.isActive) {
        operationRecord.activate();
      } else {
        operationRecord.deactivate();
      }
    }

    return this.operationRecordRepository.save(operationRecord);
  }

  async deleteOperationRecord(tenantId: string, id: string): Promise<void> {
    await this.operationRecordRepository.delete(id, tenantId);
  }

  async getAllOperationRecords(tenantId: string): Promise<OperationRecord[]> {
    return this.operationRecordRepository.findAll(tenantId);
  }
}
