import { AccountType } from '../enums/AccountType.js';

export interface ManagementAccountProps {
    id: string;
    tenantId: string;
    code: string;
    description: string;
    type: AccountType;
    categoryIds?: string[] | undefined;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class ManagementAccount {
    private readonly id: string;
    private readonly tenantId: string;
    private code: string;
    private description: string;
    private type: AccountType;
    private categoryIds: string[];
    private isActive: boolean;
    private readonly createdAt: Date;
    private updatedAt: Date;

    constructor(props: ManagementAccountProps) {
        this.validateProps(props);
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.code = props.code;
        this.description = props.description;
        this.type = props.type;
        this.categoryIds = props.categoryIds ?? [];
        this.isActive = props.isActive;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    static create(
        tenantId: string,
        code: string,
        description: string,
        type: AccountType,
        categoryIds?: string[]
    ): ManagementAccount {
        const now = new Date();
        return new ManagementAccount({
            id: crypto.randomUUID(),
            tenantId,
            code,
            description,
            type,
            categoryIds,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });
    }

    private validateProps(props: ManagementAccountProps): void {
        if (!props.code || props.code.trim().length === 0) {
            throw new Error('Code is required');
        }
        if (!props.description || props.description.trim().length === 0) {
            throw new Error('Description is required');
        }
        if (!props.tenantId) {
            throw new Error('Tenant ID is required');
        }
    }

    update(code: string, description: string, type: AccountType, categoryIds?: string[]): void {
        if (!code || code.trim().length === 0) {
            throw new Error('Code is required');
        }
        if (!description || description.trim().length === 0) {
            throw new Error('Description is required');
        }

        this.code = code;
        this.description = description;
        this.type = type;
        if (categoryIds !== undefined) {
            this.categoryIds = categoryIds;
        }
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
    getType(): AccountType { return this.type; }
    getCategoryIds(): string[] { return this.categoryIds; }
    getIsActive(): boolean { return this.isActive; }
    getCreatedAt(): Date { return this.createdAt; }
    getUpdatedAt(): Date { return this.updatedAt; }
}
