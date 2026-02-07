import { CostCenter } from '../entities/CostCenter.js';

export interface ICostCenterRepository {
    findAll(tenantId: string): Promise<CostCenter[]>;
    findById(id: string, tenantId: string): Promise<CostCenter | null>;
    findByCode(code: string, tenantId: string): Promise<CostCenter | null>;
    findByAssetId(assetId: string, tenantId: string): Promise<CostCenter | null>;
    findByCategoryCode(tenantId: string, categoryCode: string): Promise<CostCenter[]>;
    save(costCenter: CostCenter): Promise<CostCenter>;
    delete(id: string, tenantId: string): Promise<void>;
}
