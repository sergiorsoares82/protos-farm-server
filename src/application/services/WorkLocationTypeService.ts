import { WorkLocationType } from '../../domain/entities/WorkLocationType.js';
import type { IWorkLocationTypeRepository } from '../../domain/repositories/IWorkLocationTypeRepository.js';
import type {
  CreateWorkLocationTypeDTO,
  UpdateWorkLocationTypeDTO,
} from '../dtos/WorkLocationTypeDTOs.js';

const SYSTEM_TALHAO = { code: 'TALHAO', name: 'Talhão', isTalhao: true, isSystem: true as const };
const DEFAULT_TYPES: { code: string; name: string; isTalhao: boolean; isSystem: boolean }[] = [
  SYSTEM_TALHAO,
  { code: 'GALPAO', name: 'Galpão', isTalhao: false, isSystem: false },
  { code: 'ORDENHA', name: 'Ordenha', isTalhao: false, isSystem: false },
  { code: 'FABRICA_RACAO', name: 'Fábrica de ração', isTalhao: false, isSystem: false },
  { code: 'OUTRO', name: 'Outro', isTalhao: false, isSystem: false },
];

export class WorkLocationTypeService {
  constructor(private readonly workLocationTypeRepository: IWorkLocationTypeRepository) {}

  async ensureDefaultTypes(tenantId: string): Promise<void> {
    const existing = await this.workLocationTypeRepository.findAll(tenantId);
    const existingCodes = new Set(existing.map((t) => t.getCode()));

    const systemTalhao = await this.workLocationTypeRepository.findSystemByCode('TALHAO');
    if (!systemTalhao) {
      const type = WorkLocationType.create(
        null,
        SYSTEM_TALHAO.code,
        SYSTEM_TALHAO.name,
        SYSTEM_TALHAO.isTalhao,
        SYSTEM_TALHAO.isSystem,
      );
      await this.workLocationTypeRepository.save(type);
    }

    for (const def of DEFAULT_TYPES) {
      if (def.isSystem) continue;
      if (!existingCodes.has(def.code)) {
        const type = WorkLocationType.create(
          tenantId,
          def.code,
          def.name,
          def.isTalhao,
          def.isSystem,
        );
        await this.workLocationTypeRepository.save(type);
      }
    }
  }

  async createType(
    tenantId: string,
    data: CreateWorkLocationTypeDTO,
  ): Promise<WorkLocationType> {
    if (data.code.toUpperCase() === 'TALHAO') {
      throw new Error('TALHAO is a system work location type and cannot be created manually');
    }
    const existing = await this.workLocationTypeRepository.findByCode(data.code, tenantId);
    if (existing) {
      throw new Error(`Work location type with code '${data.code}' already exists`);
    }
    const type = WorkLocationType.create(
      tenantId,
      data.code,
      data.name,
      data.isTalhao,
    );
    return this.workLocationTypeRepository.save(type);
  }

  async getType(tenantId: string, id: string): Promise<WorkLocationType> {
    const type = await this.workLocationTypeRepository.findById(id, tenantId);
    if (!type) {
      throw new Error('Work location type not found');
    }
    return type;
  }

  async updateType(
    tenantId: string,
    id: string,
    data: UpdateWorkLocationTypeDTO,
  ): Promise<WorkLocationType> {
    const type = await this.getType(tenantId, id);
    if (type.getIsSystem()) {
      throw new Error('System work location type cannot be edited');
    }
    if (data.code && data.code !== type.getCode()) {
      const existing = await this.workLocationTypeRepository.findByCode(data.code, tenantId);
      if (existing) {
        throw new Error(`Work location type with code '${data.code}' already exists`);
      }
    }
    if (data.code !== undefined || data.name !== undefined) {
      type.update(
        data.code ?? type.getCode(),
        data.name ?? type.getName(),
      );
    }
    if (data.isActive !== undefined) {
      if (data.isActive) type.activate();
      else type.deactivate();
    }
    return this.workLocationTypeRepository.save(type);
  }

  async deleteType(tenantId: string, id: string): Promise<void> {
    const type = await this.workLocationTypeRepository.findById(id, tenantId);
    if (!type) {
      throw new Error('Work location type not found');
    }
    if (type.getIsSystem()) {
      throw new Error('System work location type cannot be deleted');
    }
    await this.workLocationTypeRepository.delete(id, tenantId);
  }

  async getAllTypes(tenantId: string): Promise<WorkLocationType[]> {
    return this.workLocationTypeRepository.findAll(tenantId);
  }
}
