import { Field } from '../../domain/entities/Field.js';
import type { IFieldRepository } from '../../domain/repositories/IFieldRepository.js';
import type { CreateFieldDTO, UpdateFieldDTO } from '../dtos/FieldDTOs.js';

export class FieldService {
  constructor(private readonly fieldRepository: IFieldRepository) {}

  async createField(tenantId: string, data: CreateFieldDTO): Promise<Field> {
    const existing = await this.fieldRepository.findByCode(data.code, tenantId);
    if (existing) {
      throw new Error(`Field with code '${data.code}' already exists`);
    }

    const field = Field.create(
      tenantId,
      data.code,
      data.name,
      data.areaHectares,
    );

    return this.fieldRepository.save(field);
  }

  async getField(tenantId: string, id: string): Promise<Field> {
    const field = await this.fieldRepository.findById(id, tenantId);
    if (!field) {
      throw new Error('Field not found');
    }
    return field;
  }

  async updateField(tenantId: string, id: string, data: UpdateFieldDTO): Promise<Field> {
    const field = await this.getField(tenantId, id);

    if (data.code && data.code !== field.getCode()) {
      const existing = await this.fieldRepository.findByCode(data.code, tenantId);
      if (existing) {
        throw new Error(`Field with code '${data.code}' already exists`);
      }
    }

    if (data.code || data.name || data.areaHectares !== undefined) {
      field.update(
        data.code || field.getCode(),
        data.name || field.getName(),
        data.areaHectares !== undefined ? data.areaHectares : field.getAreaHectares(),
      );
    }

    if (data.isActive !== undefined) {
      if (data.isActive) {
        field.activate();
      } else {
        field.deactivate();
      }
    }

    return this.fieldRepository.save(field);
  }

  async deleteField(tenantId: string, id: string): Promise<void> {
    await this.fieldRepository.delete(id, tenantId);
  }

  async getAllFields(tenantId: string): Promise<Field[]> {
    return this.fieldRepository.findAll(tenantId);
  }
}

