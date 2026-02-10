/**
 * Reverte a última migration executada.
 * Uso: npm run migration:revert (ou tsx src/scripts/revertMigration.ts)
 */
import '../config/env.js';
import { AppDataSource } from '../infrastructure/database/typeorm.config.js';

async function run(): Promise<void> {
  try {
    await AppDataSource.initialize();
    await AppDataSource.undoLastMigration({ transaction: 'all' });
    console.log('Última migration revertida.');
  } catch (error) {
    console.error('Erro ao reverter migration:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

run();
