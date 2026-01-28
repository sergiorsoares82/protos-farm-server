import { CostCenterType } from '../enums/CostCenterType.js';

export interface CostCenterProps {
    id: string;
    tenantId: string;
    code: string;
    description: string;
    type: CostCenterType;
    categoryId?: string | undefined;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class CostCenter {
    private readonly id: string;
    private readonly tenantId: string;
    private code: string;
    private description: string;
    private type: CostCenterType;
    private categoryId?: string | undefined;
    private isActive: boolean;
    private readonly createdAt: Date;
    private updatedAt: Date;

    constructor(props: CostCenterProps) {
        this.validateProps(props);
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.code = props.code;
        this.description = props.description;
        this.type = props.type;
        this.categoryId = props.categoryId;
        this.isActive = props.isActive;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    static create(
        tenantId: string,
        code: string,
        description: string,
        type: CostCenterType,
        categoryId?: string
    ): CostCenter {
        const now = new Date();
        return new CostCenter({
            id: crypto.randomUUID(),
            tenantId,
            code,
            description,
            type,
            categoryId,
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

    update(code: string, description: string, type: CostCenterType, categoryId?: string): void {
        if (!code || code.trim().length === 0) {
            throw new Error('Code is required');
        }
        if (!description || description.trim().length === 0) {
            throw new Error('Description is required');
        }

        this.code = code;
        this.description = description;
        this.type = type;
        this.categoryId = categoryId;
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
    getDescription(): string { return this.description; }
    getType(): CostCenterType { return this.type; }
    getCategoryId(): string | undefined { return this.categoryId; }
    getIsActive(): boolean { return this.isActive; }
    getCreatedAt(): Date { return this.createdAt; }
    getUpdatedAt(): Date { return this.updatedAt; }

    toJSON() {
        return {
            id: this.id,
            tenantId: this.tenantId,
            code: this.code,
            description: this.description,
            type: this.type,
            categoryId: this.categoryId,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
