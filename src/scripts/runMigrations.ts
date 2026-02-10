/**
 * Executa todas as migrations pendentes.
 * Uso: npm run migration:run (ou tsx src/scripts/runMigrations.ts)
 */
import '../config/env.js';
import { AppDataSource } from '../infrastructure/database/typeorm.config.js';

async function run(): Promise<void> {
  try {
    await AppDataSource.initialize();
    const executed = await AppDataSource.runMigrations({ transaction: 'all' });
    if (executed.length === 0) {
      console.log('Nenhuma migration pendente.');
    } else {
      console.log(`Executadas ${executed.length} migration(s):`);
      executed.forEach((m) => console.log('  -', m.name));
    }
  } catch (error) {
    console.error('Erro ao executar migrations:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

run();
