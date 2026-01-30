/**
 * Seed script: ensures the system work location type "Talhão" (TALHAO) exists
 * for every tenant, with is_system = true (cannot be edited or deleted).
 *
 * Run with: npx tsx src/scripts/seedWorkLocationTypeTalhao.ts
 * Or: npm run seed:work-location-type
 */
import { AppDataSource, initializeDatabase } from '../infrastructure/database/typeorm.config.js';
import { OrganizationEntity } from '../infrastructure/database/entities/OrganizationEntity.js';
import { WorkLocationTypeEntity } from '../infrastructure/database/entities/WorkLocationTypeEntity.js';

const TALHAO_CODE = 'TALHAO';
const TALHAO_NAME = 'Talhão';

async function seedWorkLocationTypeTalhao() {
  try {
    console.log('🌱 Seeding system work location type "Talhão" for all tenants...');

    await initializeDatabase();

    const orgRepo = AppDataSource.getRepository(OrganizationEntity);
    const typeRepo = AppDataSource.getRepository(WorkLocationTypeEntity);

    const orgs = await orgRepo.find({ where: { isActive: true } });
    if (orgs.length === 0) {
      console.log('ℹ️  No organizations found. Create organizations first (e.g. run seedOrganizations).');
      await AppDataSource.destroy();
      process.exit(0);
    }

    let created = 0;
    let skipped = 0;

    for (const org of orgs) {
      const existing = await typeRepo.findOne({
        where: { tenantId: org.id, code: TALHAO_CODE },
      });
      if (existing) {
        if (!existing.isSystem) {
          existing.isSystem = true;
          await typeRepo.save(existing);
          console.log(`  ✅ Updated ${org.name}: Talhão marked as system type`);
          created++;
        } else {
          skipped++;
        }
        continue;
      }

      const type = new WorkLocationTypeEntity();
      type.id = crypto.randomUUID();
      type.tenantId = org.id;
      type.code = TALHAO_CODE;
      type.name = TALHAO_NAME;
      type.isTalhao = true;
      type.isSystem = true;
      type.isActive = true;
      await typeRepo.save(type);
      console.log(`  ✅ Created Talhão (system type) for ${org.name}`);
      created++;
    }

    console.log(`\n🎉 Done. Created/updated: ${created}, skipped (already exists): ${skipped}`);
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

seedWorkLocationTypeTalhao();
