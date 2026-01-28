import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, TableInheritance } from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';

@Entity('items')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class ItemEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', name: 'tenant_id' })
    @Index()
    tenantId!: string;

    @Column({ type: 'varchar', length: 200 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'varchar', length: 50 })
    type!: string; // 'PRODUCT', 'SERVICE', 'ASSET', 'PAYROLL'

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    price!: number | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    unit!: string | null; // kg, hour, unit, liter, etc.

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => OrganizationEntity)
    @JoinColumn({ name: 'tenant_id' })
    tenant!: OrganizationEntity;
}
