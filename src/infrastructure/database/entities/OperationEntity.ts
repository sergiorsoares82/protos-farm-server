import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    JoinTable,
    Index,
} from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';
import { ActivityTypeEntity } from './ActivityTypeEntity.js';

@Entity('operations')
export class OperationEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', name: 'tenant_id' })
    @Index()
    tenantId!: string;

    @Column({ type: 'varchar', length: 50 })
    code!: string;

    @Column({ type: 'varchar', length: 200 })
    description!: string;

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => OrganizationEntity)
    @JoinColumn({ name: 'tenant_id' })
    tenant!: OrganizationEntity;

    @ManyToMany(() => ActivityTypeEntity)
    @JoinTable({
        name: 'operation_activity_types',
        joinColumn: { name: 'operation_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'activity_type_id', referencedColumnName: 'id' },
    })
    activityTypes?: ActivityTypeEntity[];
}
