import { CostCenterCategory } from '../../domain/entities/CostCenterCategory.js';
import type { ICostCenterCategoryRepository } from '../../domain/repositories/ICostCenterCategoryRepository.js';
import type {
  CreateCostCenterCategoryDTO,
  UpdateCostCenterCategoryDTO,
} from '../dtos/CostCenterCategoryDTOs.js';

export class CostCenterCategoryService {
  constructor(private readonly categoryRepository: ICostCenterCategoryRepository) {}

  async createCategory(
    tenantId: string,
    data: CreateCostCenterCategoryDTO,
  ): Promise<CostCenterCategory> {
    const existing = await this.categoryRepository.findByCode(data.code, tenantId);
    if (existing) {
      throw new Error(`Cost center category with code '${data.code}' already exists`);
    }

    const category = CostCenterCategory.create(
      tenantId,
      data.code,
      data.name,
      data.description,
    );
    return this.categoryRepository.save(category);
  }

  async getCategory(tenantId: string, id: string): Promise<CostCenterCategory> {
    const category = await this.categoryRepository.findById(id, tenantId);
    if (!category) {
      throw new Error('Cost center category not found');
    }
    return category;
  }

  async updateCategory(
    tenantId: string,
    id: string,
    data: UpdateCostCenterCategoryDTO,
  ): Promise<CostCenterCategory> {
    const category = await this.getCategory(tenantId, id);

    if (data.code && data.code !== category.getCode()) {
      const existing = await this.categoryRepository.findByCode(data.code, tenantId);
      if (existing) {
        throw new Error(`Cost center category with code '${data.code}' already exists`);
      }
    }

    if (data.code || data.name || data.description !== undefined) {
      category.update(
        data.code || category.getCode(),
        data.name || category.getName(),
        data.description !== undefined ? data.description : category.getDescription(),
      );
    }

    if (data.isActive !== undefined) {
      if (data.isActive) {
        category.activate();
      } else {
        category.deactivate();
      }
    }

    return this.categoryRepository.save(category);
  }

  async deleteCategory(tenantId: string, id: string): Promise<void> {
    await this.categoryRepository.delete(id, tenantId);
  }

  async getAllCategories(tenantId: string): Promise<CostCenterCategory[]> {
    return this.categoryRepository.findAll(tenantId);
  }
}

