/**
 * Seed script: ensures system unit of measure conversions (tenant_id = null),
 * e.g. 1 T = 1000 KG, 1 SC = 60 KG. Run after seedUnitOfMeasures.
 *
 * Run from server directory:
 *   npm run seed:unit-of-measure-conversions
 *   or: npx tsx src/scripts/seedUnitOfMeasureConversions.ts
 */
import '../config/env.js';
import { AppDataSource, initializeDatabase } from '../infrastructure/database/typeorm.config.js';
import { UnitOfMeasureEntity } from '../infrastructure/database/entities/UnitOfMeasureEntity.js';
import { UnitOfMeasureConversionEntity } from '../infrastructure/database/entities/UnitOfMeasureConversionEntity.js';
import { IsNull } from 'typeorm';

/** 1 fromUnit = factor * toUnit */
const SYSTEM_CONVERSIONS: { fromCode: string; toCode: string; factor: number }[] = [
  { fromCode: 'T', toCode: 'KG', factor: 1000 },
  { fromCode: 'G', toCode: 'KG', factor: 0.001 },
  { fromCode: 'SC', toCode: 'KG', factor: 60 },
  { fromCode: 'L', toCode: 'ML', factor: 1000 },
  { fromCode: 'KG', toCode: 'G', factor: 1000 },
  { fromCode: 'ML', toCode: 'L', factor: 0.001 },
];

async function seedUnitOfMeasureConversions() {
  try {
    console.log('🌱 Seeding system unit of measure conversions...');

    await initializeDatabase();

    const unitRepo = AppDataSource.getRepository(UnitOfMeasureEntity);
    const conversionRepo = AppDataSource.getRepository(UnitOfMeasureConversionEntity);

    for (const def of SYSTEM_CONVERSIONS) {
      const fromUnit = await unitRepo.findOne({
        where: { code: def.fromCode, tenantId: IsNull() },
      });
      const toUnit = await unitRepo.findOne({
        where: { code: def.toCode, tenantId: IsNull() },
      });

      if (!fromUnit || !toUnit) {
        console.log(
          `  ⏭️  Skipping ${def.fromCode} → ${def.toCode}: unit(s) not found. Run seed:unit-of-measures first.`,
        );
        continue;
      }

      const existing = await conversionRepo.findOne({
        where: {
          fromUnitId: fromUnit.id,
          toUnitId: toUnit.id,
          tenantId: IsNull(),
        },
      });

      if (!existing) {
        const entity = conversionRepo.create({
          id: crypto.randomUUID(),
          tenantId: null,
          fromUnitId: fromUnit.id,
          toUnitId: toUnit.id,
          factor: String(def.factor),
          isSystem: true,
        });
        await conversionRepo.save(entity);
        console.log(`  ✅ Created: 1 ${def.fromCode} = ${def.factor} ${def.toCode}`);
      } else {
        console.log(`  ℹ️  Already exists: 1 ${def.fromCode} = ${def.factor} ${def.toCode}`);
      }
    }

    console.log('\n🎉 Done. System unit conversions are ready.');
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

seedUnitOfMeasureConversions();
