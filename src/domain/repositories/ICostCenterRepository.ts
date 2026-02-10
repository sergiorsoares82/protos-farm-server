import { CostCenter } from '../entities/CostCenter.js';

export interface ICostCenterRepository {
    findAll(tenantId: string): Promise<CostCenter[]>;
    findById(id: string, tenantId: string): Promise<CostCenter | null>;
    findByCode(code: string, tenantId: string): Promise<CostCenter | null>;
    findByAssetId(assetId: string, tenantId: string): Promise<CostCenter | null>;
    findByCategoryCode(tenantId: string, categoryCode: string): Promise<CostCenter[]>;
    findByKindCategoryId(tenantId: string, kindCategoryId: string): Promise<CostCenter[]>;
    findByParentId(tenantId: string, parentId: string | null): Promise<CostCenter[]>;
    findRoots(tenantId: string): Promise<CostCenter[]>;
    countByKindCategoryId(tenantId: string, kindCategoryId: string): Promise<number>;
    save(costCenter: CostCenter): Promise<CostCenter>;
    delete(id: string, tenantId: string): Promise<void>;
}
