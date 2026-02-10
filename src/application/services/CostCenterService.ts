import { DataSource } from 'typeorm';
import { CostCenter } from '../../domain/entities/CostCenter.js';
import { Machine } from '../../domain/entities/Machine.js';
import { Building } from '../../domain/entities/Building.js';
import { CostCenterKind } from '../../domain/enums/CostCenterKind.js';
import type { ICostCenterRepository } from '../../domain/repositories/ICostCenterRepository.js';
import type { ICostCenterKindCategoryRepository } from '../../domain/repositories/ICostCenterKindCategoryRepository.js';
import type { IMachineRepository } from '../../domain/repositories/IMachineRepository.js';
import type { IBuildingRepository } from '../../domain/repositories/IBuildingRepository.js';
import type { IAssetRepository } from '../../domain/repositories/IAssetRepository.js';
import type { IMachineTypeRepository } from '../../domain/repositories/IMachineTypeRepository.js';
import type { IFieldRepository } from '../../domain/repositories/IFieldRepository.js';
import type { CreateCostCenterDTO, UpdateCostCenterDTO, CreateMachineWithCostCenterDTO } from '../dtos/CostCenterDTOs.js';
import type { CreateBuildingWithCostCenterDTO } from '../dtos/BuildingDTOs.js';
import type { CostCenterTreeNodeDTO } from '../dtos/CostCenterTreeDTOs.js';
import { AppDataSource } from '../../infrastructure/database/typeorm.config.js';
import { InvoiceItemEntity } from '../../infrastructure/database/entities/InvoiceItemEntity.js';

function kindCodeToCostCenterKind(code: string): CostCenterKind {
    if (code === 'MACHINE') return CostCenterKind.MACHINE;
    if (code === 'BUILDING') return CostCenterKind.BUILDING;
    return CostCenterKind.GENERAL;
}

export class CostCenterService {
    constructor(
        private readonly costCenterRepository: ICostCenterRepository,
        private readonly kindCategoryRepository: ICostCenterKindCategoryRepository,
        private readonly assetRepository?: IAssetRepository,
        private readonly machineRepository?: IMachineRepository,
        private readonly buildingRepository?: IBuildingRepository,
        private readonly machineTypeRepository?: IMachineTypeRepository,
        private readonly fieldRepository?: IFieldRepository,
    ) {}

    async createCostCenter(tenantId: string, data: CreateCostCenterDTO): Promise<CostCenter> {
        const existing = await this.costCenterRepository.findByCode(data.code, tenantId);
        if (existing) {
            throw new Error(`Cost Center with code '${data.code}' already exists`);
        }

        const kindCategory = await this.kindCategoryRepository.findById(data.kindCategoryId, tenantId);
        if (!kindCategory) {
            throw new Error('Cost center kind category not found');
        }
        const kind = kindCodeToCostCenterKind(kindCategory.getCode());

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

        if (data.parentId) {
            const parent = await this.costCenterRepository.findById(data.parentId, tenantId);
            if (!parent) {
                throw new Error('Parent cost center not found');
            }
        }

        if (data.relatedFieldId && this.fieldRepository) {
            const field = await this.fieldRepository.findById(data.relatedFieldId, tenantId);
            if (!field) {
                throw new Error('Related field not found');
            }
        }

        const costCenter = CostCenter.create(
            tenantId,
            data.code,
            data.description,
            data.type,
            kind,
            data.kindCategoryId,
            data.name,
            data.categoryId,
            data.assetId,
            data.activityTypeId,
            data.parentId,
            data.relatedFieldId,
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

        if (data.parentId !== undefined) {
            if (data.parentId === id) {
                throw new Error('Cost center cannot be its own parent');
            }
            if (data.parentId) {
                const parent = await this.costCenterRepository.findById(data.parentId, tenantId);
                if (!parent) {
                    throw new Error('Parent cost center not found');
                }
                let node: CostCenter | null = parent;
                while (node) {
                    if (node.getId() === id) {
                        throw new Error('Cycle detected: parent would be a descendant of this cost center');
                    }
                    node = node.getParentId()
                        ? await this.costCenterRepository.findById(node.getParentId()!, tenantId)
                        : null;
                }
            }
        }

        if (data.relatedFieldId !== undefined && data.relatedFieldId && this.fieldRepository) {
            const field = await this.fieldRepository.findById(data.relatedFieldId, tenantId);
            if (!field) {
                throw new Error('Related field not found');
            }
        }

        let kind = costCenter.getKind();
        let kindCategoryId = costCenter.getKindCategoryId();
        if (data.kindCategoryId) {
            const kindCategory = await this.kindCategoryRepository.findById(data.kindCategoryId, tenantId);
            if (!kindCategory) {
                throw new Error('Cost center kind category not found');
            }
            kind = kindCodeToCostCenterKind(kindCategory.getCode());
            kindCategoryId = data.kindCategoryId;
        }

        if (
            data.code ||
            data.description ||
            data.type ||
            data.kindCategoryId !== undefined ||
            data.categoryId !== undefined ||
            data.assetId !== undefined ||
            data.parentId !== undefined ||
            data.relatedFieldId !== undefined
        ) {
            costCenter.update(
                data.code || costCenter.getCode(),
                data.description || costCenter.getDescription(),
                data.type || costCenter.getType(),
                kind,
                kindCategoryId,
                data.name !== undefined ? data.name : costCenter.getName(),
                data.categoryId !== undefined ? data.categoryId : costCenter.getCategoryId(),
                data.assetId !== undefined ? data.assetId : costCenter.getAssetId(),
                data.activityTypeId !== undefined ? data.activityTypeId : costCenter.getActivityTypeId(),
                data.parentId !== undefined ? data.parentId : costCenter.getParentId(),
                data.relatedFieldId !== undefined ? data.relatedFieldId : costCenter.getRelatedFieldId(),
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

    /** Retorna centros de custo da categoria de tipo (kind category) informada. */
    async getCostCentersByKindCategoryId(tenantId: string, kindCategoryId: string): Promise<CostCenter[]> {
        return this.costCenterRepository.findByKindCategoryId(tenantId, kindCategoryId);
    }

    /** Retorna centros de custo que não têm pai (raiz da hierarquia). */
    async getRootCostCenters(tenantId: string): Promise<CostCenter[]> {
        return this.costCenterRepository.findRoots(tenantId);
    }

    /** Retorna filhos diretos de um centro de custo. */
    async getChildCostCenters(tenantId: string, parentId: string): Promise<CostCenter[]> {
        return this.costCenterRepository.findByParentId(tenantId, parentId);
    }

    /**
     * Retorna árvore de centros de custo com custo direto e custo total (roll-up) no período.
     * Fonte de valor: invoice_items (quantity * unit_price), filtrado por invoice.issue_date.
     */
    async getTreeWithCosts(
        tenantId: string,
        fromDate: string,
        toDate: string,
    ): Promise<CostCenterTreeNodeDTO[]> {
        const all = await this.costCenterRepository.findAll(tenantId);
        const itemRepo = AppDataSource.getRepository(InvoiceItemEntity);
        const rows = await itemRepo
            .createQueryBuilder('item')
            .innerJoin('item.invoice', 'inv')
            .where('item.cost_center_id IS NOT NULL')
            .andWhere('inv.tenantId = :tenantId', { tenantId })
            .andWhere('inv.issueDate BETWEEN :fromDate AND :toDate', { fromDate, toDate })
            .select('item.cost_center_id', 'costCenterId')
            .addSelect('SUM(item.quantity * item.unit_price)', 'total')
            .groupBy('item.cost_center_id')
            .getRawMany<{ costCenterId: string; total: string }>();

        const directMap = new Map<string, number>();
        for (const r of rows) {
            directMap.set(r.costCenterId, Number(r.total));
        }

        const byId = new Map<string, { cc: CostCenter; depth: number; custoDireto: number; custoTotal: number }>();
        const childrenMap = new Map<string | null, string[]>();
        for (const cc of all) {
            const parentId = cc.getParentId() ?? null;
            if (!childrenMap.has(parentId)) {
                childrenMap.set(parentId, []);
            }
            childrenMap.get(parentId)!.push(cc.getId());
            byId.set(cc.getId(), {
                cc,
                depth: 0,
                custoDireto: directMap.get(cc.getId()) ?? 0,
                custoTotal: directMap.get(cc.getId()) ?? 0,
            });
        }

        function getDepth(id: string): number {
            const row = byId.get(id);
            if (!row) return 0;
            if (row.depth > 0) return row.depth;
            const cc = row.cc;
            const parentId = cc.getParentId();
            row.depth = parentId ? getDepth(parentId) + 1 : 0;
            return row.depth;
        }
        for (const cc of all) {
            getDepth(cc.getId());
        }

        const byDepth = new Map<number, string[]>();
        for (const [id, row] of byId) {
            const d = row.depth;
            if (!byDepth.has(d)) byDepth.set(d, []);
            byDepth.get(d)!.push(id);
        }
        const maxDepth = Math.max(...byDepth.keys(), 0);
        for (let d = maxDepth; d >= 0; d--) {
            const ids = byDepth.get(d) ?? [];
            for (const id of ids) {
                const row = byId.get(id)!;
                const childIds = childrenMap.get(id) ?? [];
                const childTotal = childIds.reduce((sum, cid) => sum + (byId.get(cid)?.custoTotal ?? 0), 0);
                row.custoTotal = row.custoDireto + childTotal;
            }
        }

        const result: CostCenterTreeNodeDTO[] = [];
        for (const cc of all) {
            const row = byId.get(cc.getId())!;
            const childIds = childrenMap.get(cc.getId()) ?? [];
            result.push({
                id: cc.getId(),
                parentId: cc.getParentId() ?? null,
                code: cc.getCode(),
                name: cc.getName() ?? null,
                description: cc.getDescription(),
                kind: cc.getKind(),
                type: cc.getType(),
                nivel: row.depth,
                custoDireto: Math.round(row.custoDireto * 100) / 100,
                custoTotal: Math.round(row.custoTotal * 100) / 100,
                temFilhos: childIds.length > 0,
            });
        }
        result.sort((a, b) => a.nivel !== b.nivel ? a.nivel - b.nivel : a.code.localeCompare(b.code));
        return result;
    }

    /** Retorna o id da kind category pelo código (ex: MACHINE, BUILDING, GENERAL). Útil para fluxos legados. */
    async getKindCategoryIdByCode(tenantId: string, code: string): Promise<string> {
        const kindCategory = await this.kindCategoryRepository.findByCode(code, tenantId);
        if (!kindCategory) {
            throw new Error(`Cost center kind category with code '${code}' not found. Run seed or create it.`);
        }
        return kindCategory.getId();
    }

    /** Cria uma máquina completa com centro de custo em uma transação */
    async createMachineWithCostCenter(
        tenantId: string, 
        data: CreateMachineWithCostCenterDTO
    ): Promise<{ costCenter: CostCenter; machine: Machine }> {
        if (!this.machineRepository || !this.machineTypeRepository) {
            throw new Error('Machine repository not configured');
        }

        const kindCategory = await this.kindCategoryRepository.findById(data.kindCategoryId, tenantId);
        if (!kindCategory) {
            throw new Error('Cost center kind category not found');
        }
        if (kindCategory.getType() !== 'machine') {
            throw new Error('Kind category must be of type "machine" to create a machine cost center');
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
                data.kindCategoryId,
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

        const kindCategory = await this.kindCategoryRepository.findById(data.kindCategoryId, tenantId);
        if (!kindCategory) {
            throw new Error('Cost center kind category not found');
        }
        if (kindCategory.getType() !== 'building') {
            throw new Error('Kind category must be of type "building" to create a building cost center');
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
                data.kindCategoryId,
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
