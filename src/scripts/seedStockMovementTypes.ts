/**
 * Seed script: ensures the 6 system stock movement types (tenant_id = null),
 * available to all organizations.
 *
 * System types: Entrada inicial, Compra, Venda, Consumo, Entrada de ajuste, Saída de ajuste.
 *
 * Run from server directory:
 *   npm run seed:stock-movement-types
 *   or: npx tsx src/scripts/seedStockMovementTypes.ts
 */
import '../config/env.js';
import { AppDataSource, initializeDatabase } from '../infrastructure/database/typeorm.config.js';
import { StockMovementTypeEntity } from '../infrastructure/database/entities/StockMovementTypeEntity.js';
import { IsNull } from 'typeorm';

const SYSTEM_TYPES = [
  { code: 'ENTRADA_INICIAL', name: 'Entrada inicial', direction: 'ENTRADA' },
  { code: 'COMPRA', name: 'Compra', direction: 'ENTRADA' },
  { code: 'VENDA', name: 'Venda', direction: 'SAIDA' },
  { code: 'CONSUMO', name: 'Consumo', direction: 'SAIDA' },
  { code: 'ENTRADA_AJUSTE', name: 'Entrada de ajuste', direction: 'ENTRADA' },
  { code: 'SAIDA_AJUSTE', name: 'Saída de ajuste', direction: 'SAIDA' },
];

async function seedStockMovementTypes() {
  try {
    console.log('🌱 Seeding system stock movement types (available to all organizations)...');

    await initializeDatabase();

    const repo = AppDataSource.getRepository(StockMovementTypeEntity);

    for (const def of SYSTEM_TYPES) {
      const existing = await repo.findOne({
        where: { code: def.code, tenantId: IsNull() },
      });

      if (!existing) {
        const entity = repo.create({
          id: crypto.randomUUID(),
          tenantId: null,
          code: def.code,
          name: def.name,
          direction: def.direction,
          isSystem: true,
          isActive: true,
        });
        await repo.save(entity);
        console.log(`  ✅ Created: ${def.name} (${def.code})`);
      } else {
        console.log(`  ℹ️  Already exists: ${def.name} (${def.code})`);
      }
    }

    console.log('\n🎉 Done. System stock movement types are ready.');
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

seedStockMovementTypes();
