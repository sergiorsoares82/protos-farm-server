import { CostCenterKindCategory } from '../../domain/entities/CostCenterKindCategory.js';
import type { ICostCenterKindCategoryRepository } from '../../domain/repositories/ICostCenterKindCategoryRepository.js';
import type { ICostCenterRepository } from '../../domain/repositories/ICostCenterRepository.js';
import type {
  CreateCostCenterKindCategoryDTO,
  UpdateCostCenterKindCategoryDTO,
} from '../dtos/CostCenterKindCategoryDTOs.js';
import { CostCenterKindCategoryTypeValues } from '../../domain/enums/CostCenterKindCategoryType.js';

export class CostCenterKindCategoryService {
  constructor(
    private readonly kindCategoryRepository: ICostCenterKindCategoryRepository,
    private readonly costCenterRepository: ICostCenterRepository,
  ) {}

  async getAll(tenantId: string): Promise<CostCenterKindCategory[]> {
    return this.kindCategoryRepository.findAllByTenant(tenantId);
  }

  async getById(tenantId: string, id: string): Promise<CostCenterKindCategory> {
    const category = await this.kindCategoryRepository.findById(id, tenantId);
    if (!category) {
      throw new Error('Cost center kind category not found');
    }
    return category;
  }

  async create(
    tenantId: string,
    data: CreateCostCenterKindCategoryDTO,
  ): Promise<CostCenterKindCategory> {
    const existing = await this.kindCategoryRepository.findByCode(data.code, tenantId);
    if (existing) {
      throw new Error(`Cost center kind category with code '${data.code}' already exists`);
    }
    if (data.type !== 'general') {
      const all = await this.kindCategoryRepository.findAllByTenant(tenantId);
      const hasSameType = all.some((c) => c.getType() === data.type);
      if (hasSameType) {
        throw new Error(
          `Only one kind category of type '${data.type}' is allowed per tenant. Use type 'general' for additional categories.`,
        );
      }
    }
    const category = CostCenterKindCategory.create(
      tenantId,
      data.code,
      data.name,
      data.type,
      data.sortOrder ?? 999,
    );
    return this.kindCategoryRepository.save(category);
  }

  async update(
    tenantId: string,
    id: string,
    data: UpdateCostCenterKindCategoryDTO,
  ): Promise<CostCenterKindCategory> {
    const category = await this.getById(tenantId, id);

    if (data.code && data.code !== category.getCode()) {
      const existing = await this.kindCategoryRepository.findByCode(data.code, tenantId);
      if (existing) {
        throw new Error(`Cost center kind category with code '${data.code}' already exists`);
      }
    }

    if (data.type !== undefined && data.type !== category.getType()) {
      const all = await this.kindCategoryRepository.findAllByTenant(tenantId);
      const hasSameType = all.some((c) => c.getId() !== id && c.getType() === data.type);
      if (hasSameType) {
        throw new Error(
          `Only one kind category of type '${data.type}' is allowed per tenant.`,
        );
      }
    }

    if (
      data.code !== undefined ||
      data.name !== undefined ||
      data.type !== undefined ||
      data.sortOrder !== undefined
    ) {
      category.update(
        data.code ?? category.getCode(),
        data.name ?? category.getName(),
        data.type,
        data.sortOrder ?? category.getSortOrder(),
      );
    }

    if (data.isActive !== undefined) {
      if (data.isActive) {
        category.activate();
      } else {
        category.deactivate();
      }
    }

    return this.kindCategoryRepository.save(category);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const count = await this.costCenterRepository.countByKindCategoryId(tenantId, id);
    if (count > 0) {
      throw new Error(
        `Cannot delete: ${count} cost center(s) are linked to this category. Remove or reassign them first.`,
      );
    }
    await this.kindCategoryRepository.delete(id, tenantId);
  }
}
