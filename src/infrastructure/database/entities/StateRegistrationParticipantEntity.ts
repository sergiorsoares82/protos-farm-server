import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { StateRegistrationEntity } from './StateRegistrationEntity.js';

@Entity('state_registration_participants')
export class StateRegistrationParticipantEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'state_registration_id' })
  @Index()
  stateRegistrationId!: string;

  @Column({ type: 'varchar', length: 50, name: 'cpf' })
  cpf!: string;

  @Column({ type: 'varchar', length: 255, name: 'nome' })
  nome!: string;

  @Column({ type: 'decimal', name: 'participation', precision: 5, scale: 2, nullable: true })
  participation!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => StateRegistrationEntity, (sr) => sr.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'state_registration_id' })
  stateRegistration!: StateRegistrationEntity;
}
