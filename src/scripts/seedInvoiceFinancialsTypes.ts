/**
 * Seed script: ensures the 6 system invoice financial (payment) types (tenant_id = null),
 * available to all organizations.
 *
 * System types: Cheque, Boleto, Transferência bancária, DOC, TED, PIX.
 *
 * Run from server directory:
 *   npm run seed:invoice-financials-types
 *   or: npx tsx src/scripts/seedInvoiceFinancialsTypes.ts
 */
import '../config/env.js';
import { AppDataSource, initializeDatabase } from '../infrastructure/database/typeorm.config.js';
import { InvoiceFinancialsTypeEntity } from '../infrastructure/database/entities/InvoiceFinancialsTypeEntity.js';
import { IsNull } from 'typeorm';

const SYSTEM_NAMES = [
  'Cheque',
  'Boleto',
  'Transferência bancária',
  'DOC',
  'TED',
  'PIX',
];

async function seedInvoiceFinancialsTypes() {
  try {
    console.log('🌱 Seeding system invoice financial types (payment types, available to all organizations)...');

    await initializeDatabase();

    const repo = AppDataSource.getRepository(InvoiceFinancialsTypeEntity);

    for (const name of SYSTEM_NAMES) {
      const existing = await repo.findOne({
        where: { name, tenantId: IsNull() },
      });

      if (!existing) {
        const entity = repo.create({
          id: crypto.randomUUID(),
          tenantId: null,
          name,
          isSystem: true,
          isActive: true,
        });
        await repo.save(entity);
        console.log(`  ✅ Created: ${name}`);
      } else {
        console.log(`  ℹ️  Already exists: ${name}`);
      }
    }

    console.log('\n🎉 Done. System invoice financial types are ready.');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

seedInvoiceFinancialsTypes();
