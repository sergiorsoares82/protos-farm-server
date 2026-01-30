/**
 * Seed script: ensures one global system work location type "Talhão" (TALHAO)
 * with tenant_id = null, so it is available to all organizations.
 * Migrates existing fields from per-tenant TALHAO types to the global type
 * and removes per-tenant TALHAO records.
 *
 * Run from server directory:
 *   npm run seed:work-location-type
 *   or: npx tsx src/scripts/seedWorkLocationTypeTalhao.ts
 */
import '../config/env.js';
import { AppDataSource, initializeDatabase } from '../infrastructure/database/typeorm.config.js';
import { OrganizationEntity } from '../infrastructure/database/entities/OrganizationEntity.js';
import { WorkLocationTypeEntity } from '../infrastructure/database/entities/WorkLocationTypeEntity.js';
import { FieldEntity } from '../infrastructure/database/entities/FieldEntity.js';
import { IsNull, Not } from 'typeorm';

const TALHAO_CODE = 'TALHAO';
const TALHAO_NAME = 'Talhão';

async function seedWorkLocationTypeTalhao() {
  try {
    console.log('🌱 Seeding global system work location type "Talhão" (available to all organizations)...');

    await initializeDatabase();

    const typeRepo = AppDataSource.getRepository(WorkLocationTypeEntity);
    const fieldRepo = AppDataSource.getRepository(FieldEntity);

    let globalTalhao = await typeRepo.findOne({
      where: { code: TALHAO_CODE, tenantId: IsNull() },
    });

    if (!globalTalhao) {
      globalTalhao = typeRepo.create({
        id: crypto.randomUUID(),
        tenantId: null,
        code: TALHAO_CODE,
        name: TALHAO_NAME,
        isTalhao: true,
        isSystem: true,
        isActive: true,
      });
      await typeRepo.save(globalTalhao);
      console.log('  ✅ Created global Talhão type (tenant_id = null)');
    } else {
      console.log('  ℹ️  Global Talhão type already exists');
    }

    const perTenantTalhaoTypes = await typeRepo.find({
      where: { code: TALHAO_CODE, tenantId: Not(IsNull()) },
    });

    if (perTenantTalhaoTypes.length > 0) {
      const oldIds = perTenantTalhaoTypes.map((t) => t.id);
      const result = await fieldRepo
        .createQueryBuilder()
        .update(FieldEntity)
        .set({ workLocationTypeId: globalTalhao.id })
        .where('work_location_type_id IN (:...ids)', { ids: oldIds })
        .execute();
      const updated = result.affected ?? 0;
      if (updated > 0) {
        console.log(`  ✅ Migrated ${updated} field(s) to global Talhão type`);
      }
      await typeRepo.remove(perTenantTalhaoTypes);
      console.log(`  ✅ Removed ${perTenantTalhaoTypes.length} per-tenant Talhão type(s)`);
    }

    const orgRepo = AppDataSource.getRepository(OrganizationEntity);
    const orgCount = await orgRepo.count({ where: { isActive: true } });
    console.log(`\n🎉 Done. Global Talhão is available to all ${orgCount} active organization(s).`);
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
