import { ItemType } from '../enums/ItemType.js';

export interface ProductDetails {
    sku?: string | undefined;
    isStockControlled?: boolean | undefined;
    initialStockDate?: Date | undefined;
    stockQuantity?: number | undefined;
    minStockLevel?: number | undefined;
    category?: string | undefined;
}

export interface ItemProps {
    id: string;
    tenantId: string;
    name: string;
    description?: string | undefined;
    type: ItemType;
    price?: number | undefined;
    /** Código da unidade de medida (obrigatório). */
    unit: string;
    isActive: boolean;
    productDetails?: ProductDetails | undefined;
    createdAt: Date;
    updatedAt: Date;
}

export class Item {
    private readonly id: string;
    private readonly tenantId: string;
    private name: string;
    private description?: string | undefined;
    private readonly type: ItemType;
    private price?: number | undefined;
    private unit: string;
    private isActive: boolean;
    private productDetails?: ProductDetails | undefined;
    private readonly createdAt: Date;
    private updatedAt: Date;

    constructor(props: ItemProps) {
        this.validateProps(props);
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.name = props.name;
        this.description = props.description;
        this.type = props.type;
        this.price = props.price;
        this.unit = props.unit;
        this.isActive = props.isActive;
        this.productDetails = props.productDetails;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    /**
     * Factory method to create a new product
     */
    static createProduct(
        tenantId: string,
        name: string,
        description: string | undefined,
        price: number | undefined,
        unit: string,
        productDetails: ProductDetails
    ): Item {
        const now = new Date();
        return new Item({
            id: crypto.randomUUID(),
            tenantId,
            name,
            description,
            type: ItemType.PRODUCT,
            price,
            unit,
            isActive: true,
            productDetails,
            createdAt: now,
            updatedAt: now,
        });
    }

    /**
     * Factory method to create a new service
     */
    static createService(
        tenantId: string,
        name: string,
        description: string | undefined,
        price: number | undefined,
        unit: string
    ): Item {
        const now = new Date();
        return new Item({
            id: crypto.randomUUID(),
            tenantId,
            name,
            description,
            type: ItemType.SERVICE,
            price,
            unit,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });
    }

    private validateProps(props: ItemProps): void {
        if (!props.name || props.name.trim().length === 0) {
            throw new Error('Item name is required');
        }
        if (!props.tenantId) {
            throw new Error('Tenant ID is required');
        }
        if (!props.type) {
            throw new Error('Item type is required');
        }
        if (!props.unit || props.unit.trim().length === 0) {
            throw new Error('Unidade de medida é obrigatória');
        }
    }

    /**
     * Update item information
     */
    updateInfo(
        name: string,
        description: string | undefined,
        price: number | undefined,
        unit: string
    ): void {
        if (!name || name.trim().length === 0) {
            throw new Error('Item name is required');
        }
        if (!unit || unit.trim().length === 0) {
            throw new Error('Unidade de medida é obrigatória');
        }

        this.name = name;
        this.description = description;
        this.price = price;
        this.unit = unit;
        this.updatedAt = new Date();
    }

    /**
     * Update product-specific details
     */
    updateProductDetails(details: ProductDetails): void {
        if (this.type !== ItemType.PRODUCT) {
            throw new Error('Can only update product details for product items');
        }
        this.productDetails = { ...this.productDetails, ...details };
        this.updatedAt = new Date();
    }

    /**
     * Activate item
     */
    activate(): void {
        this.isActive = true;
        this.updatedAt = new Date();
    }

    /**
     * Deactivate item
     */
    deactivate(): void {
        this.isActive = false;
        this.updatedAt = new Date();
    }

    /**
     * Check if item is low on stock (for products)
     */
    isLowStock(): boolean {
        if (this.type !== ItemType.PRODUCT || !this.productDetails) {
            return false;
        }
        const { stockQuantity, minStockLevel } = this.productDetails;
        if (stockQuantity === undefined || minStockLevel === undefined) {
            return false;
        }
        return stockQuantity <= minStockLevel;
    }

    // Getters
    getId(): string {
        return this.id;
    }

    getTenantId(): string {
        return this.tenantId;
    }

    getName(): string {
        return this.name;
    }

    getDescription(): string | undefined {
        return this.description;
    }

    getType(): ItemType {
        return this.type;
    }

    getPrice(): number | undefined {
        return this.price;
    }

    getUnit(): string {
        return this.unit;
    }

    getIsActive(): boolean {
        return this.isActive;
    }

    getProductDetails(): ProductDetails | undefined {
        return this.productDetails;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }

    // Serialization
    toJSON() {
        return {
            id: this.id,
            tenantId: this.tenantId,
            name: this.name,
            description: this.description,
            type: this.type,
            price: this.price,
            unit: this.unit,
            isActive: this.isActive,
            ...(this.productDetails && { productDetails: this.productDetails }),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
