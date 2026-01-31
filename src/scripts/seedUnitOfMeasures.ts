/**
 * Seed script: ensures system units of measure (tenant_id = null),
 * available to all organizations.
 *
 * Run from server directory:
 *   npm run seed:unit-of-measures
 *   or: npx tsx src/scripts/seedUnitOfMeasures.ts
 */
import '../config/env.js';
import { AppDataSource, initializeDatabase } from '../infrastructure/database/typeorm.config.js';
import { UnitOfMeasureEntity } from '../infrastructure/database/entities/UnitOfMeasureEntity.js';
import { IsNull } from 'typeorm';

const SYSTEM_UNITS: { code: string; name: string }[] = [
  { code: 'KG', name: 'Quilograma' },
  { code: 'G', name: 'Grama' },
  { code: 'T', name: 'Tonelada' },
  { code: 'L', name: 'Litro' },
  { code: 'ML', name: 'Mililitro' },
  { code: 'M3', name: 'Metro cúbico' },
  { code: 'UN', name: 'Unidade' },
  { code: 'CX', name: 'Caixa' },
  { code: 'SC', name: 'Saca (60 kg)' },
  { code: 'HA', name: 'Hectare' },
  { code: 'M2', name: 'Metro quadrado' },
  { code: 'DIA', name: 'Dia' },
  { code: 'H', name: 'Hora' },
];

async function seedUnitOfMeasures() {
  try {
    console.log('🌱 Seeding system units of measure (available to all organizations)...');

    await initializeDatabase();

    const repo = AppDataSource.getRepository(UnitOfMeasureEntity);

    for (const def of SYSTEM_UNITS) {
      const existing = await repo.findOne({
        where: { code: def.code, tenantId: IsNull() },
      });

      if (!existing) {
        const entity = repo.create({
          id: crypto.randomUUID(),
          tenantId: null,
          code: def.code,
          name: def.name,
          isSystem: true,
          isActive: true,
        });
        await repo.save(entity);
        console.log(`  ✅ Created: ${def.name} (${def.code})`);
      } else {
        console.log(`  ℹ️  Already exists: ${def.name} (${def.code})`);
      }
    }

    console.log('\n🎉 Done. System units of measure are ready.');
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

seedUnitOfMeasures();
