import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';
import { PersonEntity } from './PersonEntity.js';
import { ProductionSiteStateRegistrationEntity } from './ProductionSiteStateRegistrationEntity.js';
import { StateRegistrationParticipantEntity } from './StateRegistrationParticipantEntity.js';
import { RuralPropertyEntity } from './RuralPropertyEntity.js';

@Entity('state_registrations')
export class StateRegistrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'person_id' })
  @Index()
  personId!: string;

  // ---- Dados cadastrais (comprovante IE) ----
  @Column({ type: 'varchar', length: 50, name: 'numero_ie' })
  numeroIe!: string;

  @Column({ type: 'varchar', length: 50, name: 'cpf_cnpj', nullable: true })
  cpfCnpj!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'nome_responsavel', nullable: true })
  nomeResponsavel!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'nome_estabelecimento', nullable: true })
  nomeEstabelecimento!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'cnae_codigo', nullable: true })
  cnaeCodigo!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'cnae_descricao', nullable: true })
  cnaeDescricao!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'regime_apuracao', nullable: true })
  regimeApuracao!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'categoria', nullable: true })
  categoria!: string | null;

  @Column({ type: 'date', name: 'data_inscricao', nullable: true })
  dataInscricao!: string | null;

  @Column({ type: 'date', name: 'data_fim_contrato', nullable: true })
  dataFimContrato!: string | null;

  @Column({ type: 'varchar', length: 20, name: 'situacao', default: 'ATIVO' })
  situacao!: string;

  @Column({ type: 'date', name: 'data_situacao_inscricao', nullable: true })
  dataSituacaoInscricao!: string | null;

  // ---- Endereço do estabelecimento ----
  @Column({ type: 'varchar', length: 20, name: 'cep', nullable: true })
  cep!: string | null;

  @Column({ type: 'varchar', length: 2, name: 'uf' })
  uf!: string;

  @Column({ type: 'varchar', length: 150, name: 'municipio', nullable: true })
  municipio!: string | null;

  @Column({ type: 'varchar', length: 150, name: 'distrito_povoado', nullable: true })
  distritoPovoado!: string | null;

  @Column({ type: 'varchar', length: 150, name: 'bairro', nullable: true })
  bairro!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'logradouro', nullable: true })
  logradouro!: string | null;

  @Column({ type: 'varchar', length: 50, name: 'numero', nullable: true })
  numero!: string | null;

  @Column({ type: 'varchar', length: 150, name: 'complemento', nullable: true })
  complemento!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'referencia_localizacao', nullable: true })
  referenciaLocalizacao!: string | null;

  // ---- Outros ----
  @Column({ type: 'boolean', name: 'optante_programa_leite', default: false })
  optanteProgramaLeite!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(() => PersonEntity)
  @JoinColumn({ name: 'person_id' })
  person!: PersonEntity;

  @Column({ type: 'uuid', name: 'rural_property_id', nullable: true })
  @Index()
  ruralPropertyId!: string | null;

  @ManyToOne(() => RuralPropertyEntity, (rp) => rp.stateRegistrations, { nullable: true })
  @JoinColumn({ name: 'rural_property_id' })
  ruralProperty!: RuralPropertyEntity | null;

  @OneToMany(
    () => StateRegistrationParticipantEntity,
    (p) => p.stateRegistration,
    { cascade: true },
  )
  participants!: StateRegistrationParticipantEntity[];

  @OneToMany(
    () => ProductionSiteStateRegistrationEntity,
    (pssr) => pssr.stateRegistration,
  )
  productionSiteLinks!: ProductionSiteStateRegistrationEntity[];
}
