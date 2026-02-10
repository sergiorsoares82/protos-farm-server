import { CostCenterType } from '../enums/CostCenterType.js';
import { CostCenterKind } from '../enums/CostCenterKind.js';

export interface CostCenterProps {
    id: string;
    tenantId: string;
    code: string;
    name?: string | undefined;
    description: string;
    kind: CostCenterKind;
    kindCategoryId?: string | undefined;
    type: CostCenterType;
    hasTechnicalData: boolean;
    acquisitionDate?: Date | undefined;
    acquisitionValue?: number | undefined;
    currentValue?: number | undefined;
    categoryId?: string | undefined;
    assetId?: string | undefined;
    activityTypeId?: string | undefined;
    parentId?: string | undefined;
    relatedFieldId?: string | undefined;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class CostCenter {
    private readonly id: string;
    private readonly tenantId: string;
    private code: string;
    private name?: string | undefined;
    private description: string;
    private kind: CostCenterKind;
    private kindCategoryId?: string | undefined;
    private type: CostCenterType;
    private hasTechnicalData: boolean;
    private acquisitionDate?: Date | undefined;
    private acquisitionValue?: number | undefined;
    private currentValue?: number | undefined;
    private categoryId?: string | undefined;
    private assetId?: string | undefined;
    private activityTypeId?: string | undefined;
    private parentId?: string | undefined;
    private relatedFieldId?: string | undefined;
    private isActive: boolean;
    private readonly createdAt: Date;
    private updatedAt: Date;

    constructor(props: CostCenterProps) {
        this.validateProps(props);
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.code = props.code;
        this.name = props.name;
        this.description = props.description;
        this.kind = props.kind;
        this.kindCategoryId = props.kindCategoryId;
        this.type = props.type;
        this.hasTechnicalData = props.hasTechnicalData;
        this.acquisitionDate = props.acquisitionDate;
        this.acquisitionValue = props.acquisitionValue;
        this.currentValue = props.currentValue;
        this.categoryId = props.categoryId;
        this.assetId = props.assetId;
        this.activityTypeId = props.activityTypeId;
        this.parentId = props.parentId;
        this.relatedFieldId = props.relatedFieldId;
        this.isActive = props.isActive;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    static create(
        tenantId: string,
        code: string,
        description: string,
        type: CostCenterType,
        kind: CostCenterKind = CostCenterKind.GENERAL,
        kindCategoryId?: string,
        name?: string,
        categoryId?: string,
        assetId?: string,
        activityTypeId?: string,
        parentId?: string,
        relatedFieldId?: string,
    ): CostCenter {
        const now = new Date();
        return new CostCenter({
            id: crypto.randomUUID(),
            tenantId,
            code,
            name,
            description,
            kind,
            kindCategoryId,
            type,
            hasTechnicalData: false,
            categoryId,
            assetId,
            activityTypeId,
            parentId,
            relatedFieldId,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });
    }

    private validateProps(props: CostCenterProps): void {
        if (!props.code || props.code.trim().length === 0) {
            throw new Error('Code (Sigla) is required');
        }
        if (!props.description || props.description.trim().length === 0) {
            throw new Error('Description is required');
        }
        if (!props.tenantId) {
            throw new Error('Tenant ID is required');
        }
    }

    update(
        code: string,
        description: string,
        type: CostCenterType,
        kind?: CostCenterKind,
        kindCategoryId?: string,
        name?: string,
        categoryId?: string,
        assetId?: string | undefined,
        activityTypeId?: string | undefined,
        parentId?: string | undefined,
        relatedFieldId?: string | undefined,
    ): void {
        if (!code || code.trim().length === 0) {
            throw new Error('Code is required');
        }
        if (!description || description.trim().length === 0) {
            throw new Error('Description is required');
        }

        this.code = code;
        this.description = description;
        this.type = type;
        if (kind !== undefined) {
            this.kind = kind;
        }
        if (kindCategoryId !== undefined) {
            this.kindCategoryId = kindCategoryId;
        }
        if (name !== undefined) {
            this.name = name;
        }
        this.categoryId = categoryId;
        this.assetId = assetId;
        this.activityTypeId = activityTypeId;
        if (parentId !== undefined) {
            this.parentId = parentId;
        }
        if (relatedFieldId !== undefined) {
            this.relatedFieldId = relatedFieldId;
        }
        this.updatedAt = new Date();
    }

    setKind(kind: CostCenterKind): void {
        this.kind = kind;
        this.updatedAt = new Date();
    }

    setKindCategoryId(kindCategoryId: string | undefined): void {
        this.kindCategoryId = kindCategoryId;
        this.updatedAt = new Date();
    }

    setParentId(parentId: string | undefined): void {
        this.parentId = parentId;
        this.updatedAt = new Date();
    }

    setRelatedFieldId(relatedFieldId: string | undefined): void {
        this.relatedFieldId = relatedFieldId;
        this.updatedAt = new Date();
    }

    setName(name: string): void {
        this.name = name;
        this.updatedAt = new Date();
    }

    setHasTechnicalData(hasTechnicalData: boolean): void {
        this.hasTechnicalData = hasTechnicalData;
        this.updatedAt = new Date();
    }

    setAcquisitionDate(date: Date | undefined): void {
        this.acquisitionDate = date;
        this.updatedAt = new Date();
    }

    setAcquisitionValue(value: number | undefined): void {
        this.acquisitionValue = value;
        this.updatedAt = new Date();
    }

    setCurrentValue(value: number | undefined): void {
        this.currentValue = value;
        this.updatedAt = new Date();
    }

    activate(): void {
        this.isActive = true;
        this.updatedAt = new Date();
    }

    deactivate(): void {
        this.isActive = false;
        this.updatedAt = new Date();
    }

    // Getters
    getId(): string { return this.id; }
    getTenantId(): string { return this.tenantId; }
    getCode(): string { return this.code; }
    getName(): string | undefined { return this.name; }
    getDescription(): string { return this.description; }
    getKind(): CostCenterKind { return this.kind; }
    getKindCategoryId(): string | undefined { return this.kindCategoryId; }
    getType(): CostCenterType { return this.type; }
    getHasTechnicalData(): boolean { return this.hasTechnicalData; }
    getAcquisitionDate(): Date | undefined { return this.acquisitionDate; }
    getAcquisitionValue(): number | undefined { return this.acquisitionValue; }
    getCurrentValue(): number | undefined { return this.currentValue; }
    getCategoryId(): string | undefined { return this.categoryId; }
    getAssetId(): string | undefined { return this.assetId; }
    getActivityTypeId(): string | undefined { return this.activityTypeId; }
    getParentId(): string | undefined { return this.parentId; }
    getRelatedFieldId(): string | undefined { return this.relatedFieldId; }
    getIsActive(): boolean { return this.isActive; }
    getCreatedAt(): Date { return this.createdAt; }
    getUpdatedAt(): Date { return this.updatedAt; }

    toJSON() {
        return {
            id: this.id,
            tenantId: this.tenantId,
            code: this.code,
            name: this.name,
            description: this.description,
            kind: this.kind,
            kindCategoryId: this.kindCategoryId,
            type: this.type,
            hasTechnicalData: this.hasTechnicalData,
            acquisitionDate: this.acquisitionDate,
            acquisitionValue: this.acquisitionValue,
            currentValue: this.currentValue,
            categoryId: this.categoryId,
            assetId: this.assetId,
            activityTypeId: this.activityTypeId,
            parentId: this.parentId,
            relatedFieldId: this.relatedFieldId,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
