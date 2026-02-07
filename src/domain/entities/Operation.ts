export interface OperationProps {
    id: string;
    tenantId: string;
    code: string;
    description: string;
    activityTypeIds?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class Operation {
    private readonly id: string;
    private readonly tenantId: string;
    private code: string;
    private description: string;
    private activityTypeIds: string[];
    private isActive: boolean;
    private readonly createdAt: Date;
    private updatedAt: Date;

    constructor(props: OperationProps) {
        this.validateProps(props);
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.code = props.code;
        this.description = props.description;
        this.activityTypeIds = props.activityTypeIds ?? [];
        this.isActive = props.isActive;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    static create(
        tenantId: string,
        code: string,
        description: string,
        activityTypeIds?: string[]
    ): Operation {
        const now = new Date();
        return new Operation({
            id: crypto.randomUUID(),
            tenantId,
            code,
            description,
            activityTypeIds,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });
    }

    private validateProps(props: OperationProps): void {
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

    update(code: string, description: string, activityTypeIds?: string[]): void {
        if (!code || code.trim().length === 0) {
            throw new Error('Code is required');
        }
        if (!description || description.trim().length === 0) {
            throw new Error('Description is required');
        }

        this.code = code;
        this.description = description;
        if (activityTypeIds !== undefined) {
            this.activityTypeIds = activityTypeIds;
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

    getId(): string { return this.id; }
    getTenantId(): string { return this.tenantId; }
    getCode(): string { return this.code; }
    getDescription(): string { return this.description; }
    getActivityTypeIds(): string[] { return this.activityTypeIds; }
    getIsActive(): boolean { return this.isActive; }
    getCreatedAt(): Date { return this.createdAt; }
    getUpdatedAt(): Date { return this.updatedAt; }
}
