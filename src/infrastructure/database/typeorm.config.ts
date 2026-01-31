import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { OrganizationEntity } from './entities/OrganizationEntity.js';
import { UserEntity } from './entities/UserEntity.js';
import { PersonEntity } from './entities/PersonEntity.js';
import { ClientEntity } from './entities/ClientEntity.js';
import { SupplierEntity } from './entities/SupplierEntity.js';
import { WorkerEntity } from './entities/WorkerEntity.js';
import { FarmOwnerEntity } from './entities/FarmOwnerEntity.js';
import { DocumentTypeEntity } from './entities/DocumentTypeEntity.js';
import { ItemEntity } from './entities/ItemEntity.js';
import { ProductEntity } from './entities/ProductEntity.js';
import { CostCenterEntity } from './entities/CostCenterEntity.js';
import { ManagementAccountEntity } from './entities/ManagementAccountEntity.js';
import { CostCenterCategoryEntity } from './entities/CostCenterCategoryEntity.js';
import { ManagementAccountCostCenterTypeEntity } from './entities/ManagementAccountCostCenterTypeEntity.js';
import { FieldEntity } from './entities/FieldEntity.js';
import { WorkLocationTypeEntity } from './entities/WorkLocationTypeEntity.js';
import { UnitOfMeasureEntity } from './entities/UnitOfMeasureEntity.js';
import { SeasonEntity } from './entities/SeasonEntity.js';
import { FieldSeasonEntity } from './entities/FieldSeasonEntity.js';
import { MachineTypeEntity } from './entities/MachineTypeEntity.js';
import { MachineEntity } from './entities/MachineEntity.js';
import { AssetEntity } from './entities/AssetEntity.js';
import { StockMovementTypeEntity } from './entities/StockMovementTypeEntity.js';
import { StockMovementEntity } from './entities/StockMovementEntity.js';
import { InvoiceEntity } from './entities/InvoiceEntity.js';
import { InvoiceItemEntity } from './entities/InvoiceItemEntity.js';
import { InvoiceFinancialEntity } from './entities/InvoiceFinancialEntity.js';

// Get database configuration from environment variables
const getDatabaseUrl = (): string => {
  // 1) Prefer DATABASE_URL if provided (Neon typically gives you this)
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    return dbUrl;
  }

  // 2) Support Neon-style PG* variables (PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT, PGSSLMODE)
  if (process.env.PGHOST && process.env.PGDATABASE && process.env.PGUSER) {
    const host = process.env.PGHOST;
    const database = process.env.PGDATABASE;
    const user = process.env.PGUSER;
    const password = process.env.PGPASSWORD || '';
    const port = process.env.PGPORT || '5432';
    const sslmode = process.env.PGSSLMODE || 'require';

    const connectionString = `postgresql://${encodeURIComponent(
      user,
    )}:${encodeURIComponent(password)}@${host}:${port}/${database}?sslmode=${sslmode}`;
    console.log(`📊 Using Neon PG* vars: host=${host}, port=${port}, user=${user}, db=${database}`);
    return connectionString;
  }

  // 3) Fallback to local docker/postgres env vars
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const username = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD || 'postgres';
  const database = process.env.POSTGRES_DB || 'protos-farm';

  const connectionString = `postgresql://${username}:${password}@${host}:${port}/${database}`;
  console.log(`📊 Database config: host=${host}, port=${port}, user=${username}, db=${database}`);

  return connectionString;
};

const isNeon =
  !!process.env.PGHOST ||
  (process.env.DATABASE_URL ? process.env.DATABASE_URL.includes('neon.tech') : false);

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: getDatabaseUrl(),
  synchronize: true, // Auto-create tables (disable in production, use migrations instead)
  logging: process.env.NODE_ENV !== 'production',
  entities: [
    OrganizationEntity,
    UserEntity,
    PersonEntity,
    ClientEntity,
    SupplierEntity,
    WorkerEntity,
    FarmOwnerEntity,
    DocumentTypeEntity,
    ItemEntity,
    ProductEntity,
    CostCenterEntity,
    ManagementAccountEntity,
    CostCenterCategoryEntity,
    ManagementAccountCostCenterTypeEntity,
    FieldEntity,
    WorkLocationTypeEntity,
    UnitOfMeasureEntity,
    SeasonEntity,
    FieldSeasonEntity,
    MachineTypeEntity,
    MachineEntity,
    AssetEntity,
    StockMovementTypeEntity,
    StockMovementEntity,
    InvoiceEntity,
    InvoiceItemEntity,
    InvoiceFinancialEntity,
  ],
  migrations: [],
  subscribers: [],
  // Neon requires SSL; local docker/postgres usually does not.
  ssl: isNeon ? { rejectUnauthorized: false } : false,
});

/**
 * Initialize the database connection
 */
export async function initializeDatabase(): Promise<DataSource> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
      // Log loaded entity metadata names/table names once, to help debug
      const metaSummary = AppDataSource.entityMetadatas.map((m) => ({
        name: m.name,
        tableName: m.tableName,
      }));
      console.log('📦 TypeORM entities metadata:', metaSummary);
    }
    return AppDataSource;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
}
