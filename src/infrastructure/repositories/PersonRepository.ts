import { Repository } from 'typeorm';
import type { IPersonRepository } from '../../domain/repositories/IPersonRepository.js';
import { Person } from '../../domain/entities/Person.js';
import { PersonRole } from '../../domain/enums/PersonRole.js';
import { PersonType } from '../../domain/enums/PersonType.js';
import { Client } from '../../domain/value-objects/roles/Client.js';
import { Supplier } from '../../domain/value-objects/roles/Supplier.js';
import { Worker } from '../../domain/value-objects/roles/Worker.js';
import { FarmOwner } from '../../domain/value-objects/roles/FarmOwner.js';
import { PersonEntity } from '../database/entities/PersonEntity.js';
import { ClientEntity } from '../database/entities/ClientEntity.js';
import { SupplierEntity } from '../database/entities/SupplierEntity.js';
import { WorkerEntity } from '../database/entities/WorkerEntity.js';
import { FarmOwnerEntity } from '../database/entities/FarmOwnerEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class PersonRepository implements IPersonRepository {
  private personRepo: Repository<PersonEntity>;
  private clientRepo: Repository<ClientEntity>;
  private supplierRepo: Repository<SupplierEntity>;
  private workerRepo: Repository<WorkerEntity>;
  private farmOwnerRepo: Repository<FarmOwnerEntity>;

  constructor() {
    // Use entity classes directly; this matches metadata registered in AppDataSource.entities
    this.personRepo = AppDataSource.getRepository(PersonEntity);
    this.clientRepo = AppDataSource.getRepository(ClientEntity);
    this.supplierRepo = AppDataSource.getRepository(SupplierEntity);
    this.workerRepo = AppDataSource.getRepository(WorkerEntity);
    this.farmOwnerRepo = AppDataSource.getRepository(FarmOwnerEntity);
  }

  async findAll(tenantId: string): Promise<Person[]> {
    const personEntities = await this.personRepo.find({
      where: { tenantId },
      relations: ['client', 'supplier', 'worker', 'farmOwner'],
      order: { createdAt: 'DESC' },
    });

    return personEntities.map((entity) => this.toDomain(entity));
  }

  async findById(id: string, tenantId: string): Promise<Person | null> {
    const personEntity = await this.personRepo.findOne({
      where: { id, tenantId },
      relations: ['client', 'supplier', 'worker', 'farmOwner'],
    });

    if (!personEntity) {
      return null;
    }

    return this.toDomain(personEntity);
  }

  async findByEmail(email: string, tenantId: string): Promise<Person | null> {
    const personEntity = await this.personRepo.findOne({
      where: { email: email.toLowerCase(), tenantId },
      relations: ['client', 'supplier', 'worker', 'farmOwner'],
    });

    if (!personEntity) {
      return null;
    }

    return this.toDomain(personEntity);
  }

  async findByUserId(userId: string, tenantId: string): Promise<Person | null> {
    const personEntity = await this.personRepo.findOne({
      where: { userId, tenantId },
      relations: ['client', 'supplier', 'worker', 'farmOwner'],
    });

    if (!personEntity) {
      return null;
    }

    return this.toDomain(personEntity);
  }

  async findByRole(role: PersonRole, tenantId: string): Promise<Person[]> {
    let personEntities: PersonEntity[] = [];

    switch (role) {
      case PersonRole.CLIENT:
        const clients = await this.clientRepo.find({ 
          where: { tenantId },
          relations: ['person'] 
        });
        personEntities = clients.map((c) => c.person);
        break;
      case PersonRole.SUPPLIER:
        const suppliers = await this.supplierRepo.find({ 
          where: { tenantId },
          relations: ['person'] 
        });
        personEntities = suppliers.map((s) => s.person);
        break;
      case PersonRole.WORKER:
        const workers = await this.workerRepo.find({ 
          where: { tenantId },
          relations: ['person'] 
        });
        personEntities = workers.map((w) => w.person);
        break;
      case PersonRole.FARM_OWNER:
        const farmOwners = await this.farmOwnerRepo.find({ 
          where: { tenantId },
          relations: ['person'] 
        });
        personEntities = farmOwners.map((f) => f.person);
        break;
    }

    // Load all roles for each person
    const personsWithRoles = await Promise.all(
      personEntities.map((p) =>
        this.personRepo.findOne({
          where: { id: p.id, tenantId },
          relations: ['client', 'supplier', 'worker', 'farmOwner'],
        })
      )
    );

    return personsWithRoles
      .filter((p): p is PersonEntity => p !== null)
      .map((p) => this.toDomain(p));
  }

  async save(person: Person, tenantId: string): Promise<Person> {
    // Validate business rule: at least one role required
    const roles = person.getRoles();
    if (roles.length === 0) {
      throw new Error('Person must have at least one role');
    }

    // Save person basic info
    const personEntity = new PersonEntity();
    personEntity.id = person.getId();
    personEntity.tenantId = tenantId;
    personEntity.userId = person.getUserId() || null;
    personEntity.nome = person.getNome();
    personEntity.personType = person.getPersonType();
    personEntity.cpfCnpj = person.getCpfCnpj() || null;
    personEntity.email = person.getEmail();
    personEntity.phone = person.getPhone() || null;

    const savedPerson = await this.personRepo.save(personEntity);

    // Save each role
    for (const role of roles) {
      await this.saveRole(savedPerson.id, role, person.getRole(role)!, tenantId);
    }

    // Reload with relations
    const reloaded = await this.findById(savedPerson.id, tenantId);
    return reloaded!;
  }

  async assignRole(
    personId: string,
    role: PersonRole,
    roleData: Client | Supplier | Worker | FarmOwner,
    tenantId: string
  ): Promise<void> {
    await this.saveRole(personId, role, roleData, tenantId);
  }

  async removeRole(personId: string, role: PersonRole, tenantId: string): Promise<void> {
    switch (role) {
      case PersonRole.CLIENT:
        await this.clientRepo.delete({ personId });
        break;
      case PersonRole.SUPPLIER:
        await this.supplierRepo.delete({ personId });
        break;
      case PersonRole.WORKER:
        await this.workerRepo.delete({ personId });
        break;
      case PersonRole.FARM_OWNER:
        await this.farmOwnerRepo.delete({ personId });
        break;
    }
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.personRepo.delete({ id, tenantId });
  }

  async existsByEmail(email: string, tenantId: string): Promise<boolean> {
    const count = await this.personRepo.count({
      where: { email: email.toLowerCase(), tenantId },
    });
    return count > 0;
  }

  private async saveRole(
    personId: string,
    role: PersonRole,
    roleData: Client | Supplier | Worker | FarmOwner,
    tenantId: string
  ): Promise<void> {
    switch (role) {
      case PersonRole.CLIENT:
        const clientData = roleData as Client;
        const client = new ClientEntity();
        client.personId = personId;
        client.tenantId = tenantId;
        client.clientCategories = clientData.getClientCategories() || null;
        await this.clientRepo.save(client);
        break;

      case PersonRole.SUPPLIER:
        const supplierData = roleData as Supplier;
        const supplier = new SupplierEntity();
        supplier.personId = personId;
        supplier.tenantId = tenantId;
        supplier.supplyCategories = supplierData.getSupplyCategories() || null;
        await this.supplierRepo.save(supplier);
        break;

      case PersonRole.WORKER:
        const workerData = roleData as Worker;
        const worker = new WorkerEntity();
        worker.personId = personId;
        worker.tenantId = tenantId;
        worker.position = workerData.getPosition();
        worker.hireDate = workerData.getHireDate();
        worker.hourlyRate = workerData.getHourlyRate() || null;
        worker.employmentType = workerData.getEmploymentType();
        await this.workerRepo.save(worker);
        break;

      case PersonRole.FARM_OWNER:
        const farmOwnerData = roleData as FarmOwner;
        const farmOwner = new FarmOwnerEntity();
        farmOwner.personId = personId;
        farmOwner.tenantId = tenantId;
        farmOwner.farmName = farmOwnerData.getFarmName();
        farmOwner.farmLocation = farmOwnerData.getFarmLocation() || null;
        farmOwner.totalArea = farmOwnerData.getTotalArea() || null;
        farmOwner.ownershipType = farmOwnerData.getOwnershipType() || null;
        await this.farmOwnerRepo.save(farmOwner);
        break;
    }
  }

  private toDomain(entity: PersonEntity): Person {
    const roles = new Map<PersonRole, Client | Supplier | Worker | FarmOwner>();

    if (entity.client) {
      roles.set(
        PersonRole.CLIENT,
        new Client({
          ...(entity.client.clientCategories && { clientCategories: entity.client.clientCategories }),
        })
      );
    }

    if (entity.supplier) {
      roles.set(
        PersonRole.SUPPLIER,
        new Supplier({
          ...(entity.supplier.supplyCategories && { supplyCategories: entity.supplier.supplyCategories }),
        })
      );
    }

    if (entity.worker) {
      roles.set(
        PersonRole.WORKER,
        new Worker({
          position: entity.worker.position,
          hireDate: new Date(entity.worker.hireDate),
          ...(entity.worker.hourlyRate && { hourlyRate: Number(entity.worker.hourlyRate) }),
          employmentType: entity.worker.employmentType,
        })
      );
    }

    if (entity.farmOwner) {
      roles.set(
        PersonRole.FARM_OWNER,
        new FarmOwner({
          farmName: entity.farmOwner.farmName,
          ...(entity.farmOwner.farmLocation && { farmLocation: entity.farmOwner.farmLocation }),
          ...(entity.farmOwner.totalArea && { totalArea: Number(entity.farmOwner.totalArea) }),
          ...(entity.farmOwner.ownershipType && { ownershipType: entity.farmOwner.ownershipType }),
        })
      );
    }

    return new Person({
      id: entity.id,
      ...(entity.userId && { userId: entity.userId }),
      nome: entity.nome,
      personType: entity.personType as PersonType,
      ...(entity.cpfCnpj && { cpfCnpj: entity.cpfCnpj }),
      email: entity.email,
      ...(entity.phone && { phone: entity.phone }),
      roles,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
