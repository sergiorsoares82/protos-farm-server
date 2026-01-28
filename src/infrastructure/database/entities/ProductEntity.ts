import { Entity, Column, ChildEntity } from 'typeorm';
import { ItemEntity } from './ItemEntity.js';

@ChildEntity('PRODUCT')
export class ProductEntity extends ItemEntity {
    @Column({ type: 'varchar', length: 100, nullable: true })
    sku!: string | null;

    @Column({ type: 'boolean', default: false, name: 'is_stock_controlled' })
    isStockControlled!: boolean;

    @Column({ type: 'date', nullable: true, name: 'initial_stock_date' })
    initialStockDate!: Date | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'stock_quantity' })
    stockQuantity!: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'min_stock_level' })
    minStockLevel!: number | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    category!: string | null;
}
