import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinColumn, JoinTable, Index } from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';
import { CostCenterCategoryEntity } from './CostCenterCategoryEntity.js';

@Entity('management_accounts')
export class ManagementAccountEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', name: 'tenant_id' })
    @Index()
    tenantId!: string;

    @Column({ type: 'varchar', length: 50 })
    code!: string;

    @Column({ type: 'varchar', length: 200 })
    description!: string;

    @Column({ type: 'varchar', length: 50 })
    type!: string; // 'REVENUE', 'EXPENSE'

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => OrganizationEntity)
    @JoinColumn({ name: 'tenant_id' })
    tenant!: OrganizationEntity;

    @ManyToMany(() => CostCenterCategoryEntity, { nullable: true })
    @JoinTable({
        name: 'management_account_categories',
        joinColumn: { name: 'management_account_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
    })
    categories?: CostCenterCategoryEntity[];
}
