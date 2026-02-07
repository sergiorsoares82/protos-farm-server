import { CostCenter } from '../../domain/entities/CostCenter.js';
import type { ICostCenterRepository } from '../../domain/repositories/ICostCenterRepository.js';
import type { IAssetRepository } from '../../domain/repositories/IAssetRepository.js';
import type { CreateCostCenterDTO, UpdateCostCenterDTO } from '../dtos/CostCenterDTOs.js';

export class CostCenterService {
    constructor(
        private readonly costCenterRepository: ICostCenterRepository,
        private readonly assetRepository?: IAssetRepository,
    ) {}

    async createCostCenter(tenantId: string, data: CreateCostCenterDTO): Promise<CostCenter> {
        const existing = await this.costCenterRepository.findByCode(data.code, tenantId);
        if (existing) {
            throw new Error(`Cost Center with code '${data.code}' already exists`);
        }

        if (data.assetId && this.assetRepository) {
            const asset = await this.assetRepository.findById(data.assetId, tenantId);
            if (!asset) {
                throw new Error('Asset not found');
            }
            const existingByAsset = await this.costCenterRepository.findByAssetId(
                data.assetId,
                tenantId,
            );
            if (existingByAsset) {
                throw new Error('A cost center is already linked to this asset');
            }
        }

        const costCenter = CostCenter.create(
            tenantId,
            data.code,
            data.description,
            data.type,
            data.categoryId,
            data.assetId,
            data.activityTypeId,
        );

        return this.costCenterRepository.save(costCenter);
    }

    async getCostCenter(tenantId: string, id: string): Promise<CostCenter> {
        const costCenter = await this.costCenterRepository.findById(id, tenantId);
        if (!costCenter) {
            throw new Error('Cost Center not found');
        }
        return costCenter;
    }

    async updateCostCenter(tenantId: string, id: string, data: UpdateCostCenterDTO): Promise<CostCenter> {
        const costCenter = await this.getCostCenter(tenantId, id);

        if (data.code && data.code !== costCenter.getCode()) {
            const existing = await this.costCenterRepository.findByCode(data.code, tenantId);
            if (existing) {
                throw new Error(`Cost Center with code '${data.code}' already exists`);
            }
        }

        if (data.assetId !== undefined && data.assetId && this.assetRepository) {
            const asset = await this.assetRepository.findById(data.assetId, tenantId);
            if (!asset) {
                throw new Error('Asset not found');
            }
            const existingByAsset = await this.costCenterRepository.findByAssetId(
                data.assetId,
                tenantId,
            );
            if (existingByAsset && existingByAsset.getId() !== id) {
                throw new Error('A cost center is already linked to this asset');
            }
        }

        if (
            data.code ||
            data.description ||
            data.type ||
            data.categoryId !== undefined ||
            data.assetId !== undefined
        ) {
            costCenter.update(
                data.code || costCenter.getCode(),
                data.description || costCenter.getDescription(),
                data.type || costCenter.getType(),
                data.categoryId !== undefined ? data.categoryId : costCenter.getCategoryId(),
                data.assetId !== undefined ? data.assetId : costCenter.getAssetId(),
                data.activityTypeId !== undefined ? data.activityTypeId : costCenter.getActivityTypeId(),
            );
        }

        if (data.isActive !== undefined) {
            if (data.isActive) {
                costCenter.activate();
            } else {
                costCenter.deactivate();
            }
        }

        return this.costCenterRepository.save(costCenter);
    }

    async deleteCostCenter(tenantId: string, id: string): Promise<void> {
        // Here we might check for dependencies before deleting
        await this.costCenterRepository.delete(id, tenantId);
    }

    async getAllCostCenters(tenantId: string): Promise<CostCenter[]> {
        return this.costCenterRepository.findAll(tenantId);
    }

    /** Retorna apenas centros de custo ativos da categoria informada (ex: AGR = Agricultura). */
    async getCostCentersByCategoryCode(tenantId: string, categoryCode: string): Promise<CostCenter[]> {
        return this.costCenterRepository.findByCategoryCode(tenantId, categoryCode);
    }
}
