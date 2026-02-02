import { ItemType } from '../../domain/enums/ItemType.js';

export interface CreateItemDTO {
    name: string;
    description?: string;
    type: ItemType;
    price?: number;
    /** Código da unidade de medida (obrigatório para produto e serviço). */
    unit: string;
    // Product-specific fields
    sku?: string;
    isStockControlled?: boolean;
    initialStockDate?: string;
    stockQuantity?: number;
    minStockLevel?: number;
    category?: string;
}

export interface UpdateItemDTO {
    name?: string;
    description?: string;
    price?: number;
    unit?: string;
    isActive?: boolean;
    // Product-specific fields
    sku?: string;
    isStockControlled?: boolean;
    initialStockDate?: string;
    stockQuantity?: number;
    minStockLevel?: number;
    category?: string;
}

export interface ItemFiltersDTO {
    type?: ItemType;
    active?: boolean;
}
