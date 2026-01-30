import { StockMovementType } from '../../domain/entities/StockMovementType.js';
import { StockMovementDirection } from '../../domain/enums/StockMovementDirection.js';
import type { IStockMovementTypeRepository } from '../../domain/repositories/IStockMovementTypeRepository.js';
import type {
  CreateStockMovementTypeDTO,
  UpdateStockMovementTypeDTO,
} from '../dtos/StockMovementTypeDTOs.js';

const SYSTEM_TYPES: { code: string; name: string; direction: StockMovementDirection }[] = [
  { code: 'ENTRADA_INICIAL', name: 'Entrada inicial', direction: StockMovementDirection.ENTRADA },
  { code: 'COMPRA', name: 'Compra', direction: StockMovementDirection.ENTRADA },
  { code: 'VENDA', name: 'Venda', direction: StockMovementDirection.SAIDA },
  { code: 'CONSUMO', name: 'Consumo', direction: StockMovementDirection.SAIDA },
  { code: 'ENTRADA_AJUSTE', name: 'Entrada de ajuste', direction: StockMovementDirection.ENTRADA },
  { code: 'SAIDA_AJUSTE', name: 'Saída de ajuste', direction: StockMovementDirection.SAIDA },
];

export class StockMovementTypeService {
  constructor(private readonly stockMovementTypeRepository: IStockMovementTypeRepository) {}

  async createType(
    tenantId: string,
    data: CreateStockMovementTypeDTO,
  ): Promise<StockMovementType> {
    const systemCodes = SYSTEM_TYPES.map((t) => t.code);
    if (systemCodes.includes(data.code.toUpperCase())) {
      throw new Error(`Code '${data.code}' is reserved for system stock movement types`);
    }
    const existing = await this.stockMovementTypeRepository.findByCode(data.code, tenantId);
    if (existing) {
      throw new Error(`Stock movement type with code '${data.code}' already exists`);
    }
    const type = StockMovementType.create(
      tenantId,
      data.code,
      data.name,
      data.direction,
    );
    return this.stockMovementTypeRepository.save(type);
  }

  async getType(tenantId: string, id: string): Promise<StockMovementType> {
    const type = await this.stockMovementTypeRepository.findById(id, tenantId);
    if (!type) {
      throw new Error('Stock movement type not found');
    }
    return type;
  }

  async updateType(
    tenantId: string,
    id: string,
    data: UpdateStockMovementTypeDTO,
  ): Promise<StockMovementType> {
    const type = await this.getType(tenantId, id);
    if (type.getIsSystem()) {
      throw new Error('System stock movement type cannot be edited');
    }
    if (data.code && data.code !== type.getCode()) {
      const existing = await this.stockMovementTypeRepository.findByCode(data.code, tenantId);
      if (existing) {
        throw new Error(`Stock movement type with code '${data.code}' already exists`);
      }
    }
    if (data.code !== undefined || data.name !== undefined || data.direction !== undefined) {
      type.update(
        data.code ?? type.getCode(),
        data.name ?? type.getName(),
        data.direction ?? type.getDirection(),
      );
    }
    if (data.isActive !== undefined) {
      if (data.isActive) type.activate();
      else type.deactivate();
    }
    return this.stockMovementTypeRepository.save(type);
  }

  async deleteType(tenantId: string, id: string): Promise<void> {
    const type = await this.stockMovementTypeRepository.findById(id, tenantId);
    if (!type) {
      throw new Error('Stock movement type not found');
    }
    if (type.getIsSystem()) {
      throw new Error('System stock movement type cannot be deleted');
    }
    await this.stockMovementTypeRepository.delete(id, tenantId);
  }

  async getAllTypes(tenantId: string): Promise<StockMovementType[]> {
    return this.stockMovementTypeRepository.findAll(tenantId);
  }
}
