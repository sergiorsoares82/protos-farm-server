import { InvoiceFinancialsType } from '../../domain/entities/InvoiceFinancialsType.js';
import type { IInvoiceFinancialsTypeRepository } from '../../domain/repositories/IInvoiceFinancialsTypeRepository.js';
import type {
  CreateInvoiceFinancialsTypeDTO,
  UpdateInvoiceFinancialsTypeDTO,
} from '../dtos/InvoiceFinancialsTypeDTOs.js';

export class InvoiceFinancialsTypeService {
  constructor(private readonly repository: IInvoiceFinancialsTypeRepository) {}

  async list(tenantId: string | null): Promise<InvoiceFinancialsType[]> {
    return this.repository.findAll(tenantId);
  }

  async getById(tenantId: string | null, id: string): Promise<InvoiceFinancialsType> {
    const type =
      tenantId != null
        ? await this.repository.findById(id, tenantId)
        : await this.repository.findByIdAny(id);
    if (!type) {
      throw new Error('Invoice financial type not found');
    }
    return type;
  }

  async create(
    tenantId: string | null,
    data: CreateInvoiceFinancialsTypeDTO,
    isSuperAdmin: boolean,
  ): Promise<InvoiceFinancialsType> {
    const effectiveTenantId = isSuperAdmin ? (data.tenantId ?? tenantId) : tenantId;
    if (effectiveTenantId == null && !isSuperAdmin) {
      throw new Error('Organization context is required to create a type');
    }
    const name = data.name?.trim();
    if (!name) {
      throw new Error('Name is required');
    }
    const isSystem = effectiveTenantId == null;
    if (effectiveTenantId != null) {
      const existing = await this.repository.findByName(effectiveTenantId, name);
      if (existing) {
        throw new Error(`Invoice financial type with name '${name}' already exists`);
      }
    } else {
      const existingSystem = await this.repository.findSystemByName(name);
      if (existingSystem) {
        throw new Error(`System invoice financial type with name '${name}' already exists`);
      }
    }
    const type = InvoiceFinancialsType.create(effectiveTenantId, name, isSystem);
    return this.repository.save(type);
  }

  async update(
    tenantId: string | null,
    id: string,
    data: UpdateInvoiceFinancialsTypeDTO,
    isSuperAdmin: boolean,
  ): Promise<InvoiceFinancialsType> {
    const type =
      tenantId != null
        ? await this.repository.findById(id, tenantId)
        : await this.repository.findByIdAny(id);
    if (!type) {
      throw new Error('Invoice financial type not found');
    }
    if (!isSuperAdmin && type.getIsSystem()) {
      throw new Error('System invoice financial type cannot be edited by organization admin');
    }
    if (!isSuperAdmin && type.getTenantId() !== tenantId) {
      throw new Error('Invoice financial type not found');
    }
    if (data.name !== undefined) {
      type.update(data.name);
    }
    if (data.isActive !== undefined) {
      if (data.isActive) {
        type.activate();
      } else {
        type.deactivate();
      }
    }
    return this.repository.save(type);
  }

  async delete(tenantId: string | null, id: string, isSuperAdmin: boolean): Promise<void> {
    const type =
      tenantId != null
        ? await this.repository.findById(id, tenantId)
        : await this.repository.findByIdAny(id);
    if (!type) {
      throw new Error('Invoice financial type not found');
    }
    if (type.getIsSystem() && !isSuperAdmin) {
      throw new Error('System invoice financial type cannot be deleted');
    }
    if (!isSuperAdmin && type.getTenantId() !== tenantId) {
      throw new Error('Invoice financial type not found');
    }
    await this.repository.delete(id, type.getTenantId());
  }
}
