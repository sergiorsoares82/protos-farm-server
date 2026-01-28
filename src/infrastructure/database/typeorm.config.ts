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

// Get database configuration from environment variables
const getDatabaseUrl = (): string => {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    return dbUrl;
  }

  // Fallback to individual env vars
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const username = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD || 'postgres';
  const database = process.env.POSTGRES_DB || 'protos-farm';

  const connectionString = `postgresql://${username}:${password}@${host}:${port}/${database}`;
  console.log(`📊 Database config: host=${host}, port=${port}, user=${username}, db=${database}`);

  return connectionString;
};

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
  ],
  migrations: [],
  subscribers: [],
});

/**
 * Initialize the database connection
 */
export async function initializeDatabase(): Promise<DataSource> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
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
