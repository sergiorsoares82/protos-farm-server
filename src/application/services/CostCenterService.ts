import { DataSource } from 'typeorm';
import { CostCenter } from '../../domain/entities/CostCenter.js';
import { Machine } from '../../domain/entities/Machine.js';
import { Building } from '../../domain/entities/Building.js';
import { CostCenterKind } from '../../domain/enums/CostCenterKind.js';
import type { ICostCenterRepository } from '../../domain/repositories/ICostCenterRepository.js';
import type { IMachineRepository } from '../../domain/repositories/IMachineRepository.js';
import type { IBuildingRepository } from '../../domain/repositories/IBuildingRepository.js';
import type { IAssetRepository } from '../../domain/repositories/IAssetRepository.js';
import type { IMachineTypeRepository } from '../../domain/repositories/IMachineTypeRepository.js';
import type { CreateCostCenterDTO, UpdateCostCenterDTO, CreateMachineWithCostCenterDTO } from '../dtos/CostCenterDTOs.js';
import type { CreateBuildingWithCostCenterDTO } from '../dtos/BuildingDTOs.js';
import { AppDataSource } from '../../infrastructure/database/typeorm.config.js';

export class CostCenterService {
    constructor(
        private readonly costCenterRepository: ICostCenterRepository,
        private readonly assetRepository?: IAssetRepository,
        private readonly machineRepository?: IMachineRepository,
        private readonly buildingRepository?: IBuildingRepository,
        private readonly machineTypeRepository?: IMachineTypeRepository,
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

    /** Cria uma máquina completa com centro de custo em uma transação */
    async createMachineWithCostCenter(
        tenantId: string, 
        data: CreateMachineWithCostCenterDTO
    ): Promise<{ costCenter: CostCenter; machine: Machine }> {
        if (!this.machineRepository || !this.machineTypeRepository) {
            throw new Error('Machine repository not configured');
        }

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Validate machine type
            const typeExists = await this.machineTypeRepository.findById(data.machineTypeId, tenantId);
            if (!typeExists) {
                throw new Error('Machine type not found');
            }

            // Check if code already exists
            const existing = await this.costCenterRepository.findByCode(data.code, tenantId);
            if (existing) {
                throw new Error(`Cost Center with code '${data.code}' already exists`);
            }

            // Create Cost Center
            const costCenter = CostCenter.create(
                tenantId,
                data.code,
                data.description,
                data.type,
                CostCenterKind.MACHINE,
                data.name,
                data.categoryId,
                undefined, // no assetId
                data.activityTypeId,
            );
            costCenter.setHasTechnicalData(true);
            if (data.acquisitionDate) {
                costCenter.setAcquisitionDate(data.acquisitionDate);
            }
            if (data.acquisitionValue) {
                costCenter.setAcquisitionValue(data.acquisitionValue);
            }

            const savedCostCenter = await this.costCenterRepository.save(costCenter);

            // Create Machine
            const machine = Machine.create(
                tenantId,
                savedCostCenter.getId(),
                data.machineTypeId,
                data.brand,
                data.model,
                data.serialNumber,
                data.horimeterInitial || 0,
            );
            if (data.powerHp) {
                machine.update(
                    data.machineTypeId,
                    data.brand,
                    data.model,
                    data.serialNumber,
                    undefined,
                    data.powerHp,
                    data.fuelType,
                );
            }

            const savedMachine = await this.machineRepository.save(machine);

            await queryRunner.commitTransaction();

            return {
                costCenter: savedCostCenter,
                machine: savedMachine,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /** Cria uma benfeitoria completa com centro de custo em uma transação */
    async createBuildingWithCostCenter(
        tenantId: string,
        data: CreateBuildingWithCostCenterDTO
    ): Promise<{ costCenter: CostCenter; building: Building }> {
        if (!this.buildingRepository) {
            throw new Error('Building repository not configured');
        }

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check if code already exists
            const existing = await this.costCenterRepository.findByCode(data.code, tenantId);
            if (existing) {
                throw new Error(`Cost Center with code '${data.code}' already exists`);
            }

            // Create Cost Center
            const costCenter = CostCenter.create(
                tenantId,
                data.code,
                data.description,
                data.type as any, // CostCenterType from string
                CostCenterKind.BUILDING,
                data.name,
                data.categoryId,
                undefined, // no assetId
                data.activityTypeId,
            );
            costCenter.setHasTechnicalData(true);
            if (data.acquisitionDate) {
                costCenter.setAcquisitionDate(data.acquisitionDate);
            }
            if (data.acquisitionValue) {
                costCenter.setAcquisitionValue(data.acquisitionValue);
            }

            const savedCostCenter = await this.costCenterRepository.save(costCenter);

            // Create Building
            const building = Building.create(
                tenantId,
                savedCostCenter.getId(),
                data.areaM2,
                data.landRegistry,
                data.locationDetails,
                data.constructionDate,
            );

            const savedBuilding = await this.buildingRepository.save(building);

            await queryRunner.commitTransaction();

            return {
                costCenter: savedCostCenter,
                building: savedBuilding,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
