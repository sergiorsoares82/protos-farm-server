/**
 * Migration: seed cost_center_kind_categories and backfill cost_centers.kind_category_id
 * Run after CostCenterKindCategoryEntity and kind_category_id column exist.
 * Usage: npx ts-node -r tsconfig-paths/register src/scripts/migrateCostCenterKindCategories.ts
 */
import '../config/env.js';

import { AppDataSource, initializeDatabase } from '../infrastructure/database/typeorm.config.js';
import { CostCenterKindCategoryEntity } from '../infrastructure/database/entities/CostCenterKindCategoryEntity.js';
import { CostCenterEntity } from '../infrastructure/database/entities/CostCenterEntity.js';

const DEFAULT_KIND_CATEGORIES = [
  { code: 'MACHINE', name: 'Máquinas', type: 'machine', sortOrder: 0 },
  { code: 'BUILDING', name: 'Benfeitorias', type: 'building', sortOrder: 1 },
  { code: 'GENERAL', name: 'Gerais', type: 'general', sortOrder: 2 },
] as const;

async function migrate() {
  await initializeDatabase();

  const kindCatRepo = AppDataSource.getRepository(CostCenterKindCategoryEntity);
  const ccRepo = AppDataSource.getRepository(CostCenterEntity);

  const tenantIds = await ccRepo
    .createQueryBuilder('cc')
    .select('DISTINCT cc.tenant_id')
    .getRawMany<{ tenant_id: string }>()
    .then((rows) => rows.map((r) => r.tenant_id));

  if (tenantIds.length === 0) {
    console.log('No cost centers found; nothing to migrate.');
    await AppDataSource.destroy();
    process.exit(0);
    return;
  }

  console.log(`Found ${tenantIds.length} tenant(s) with cost centers.`);

  for (const tenantId of tenantIds) {
    const byCode: Record<string, CostCenterKindCategoryEntity> = {};
    for (const def of DEFAULT_KIND_CATEGORIES) {
      let cat = await kindCatRepo.findOne({ where: { tenantId, code: def.code } });
      if (!cat) {
        cat = new CostCenterKindCategoryEntity();
        cat.tenantId = tenantId;
        cat.code = def.code;
        cat.name = def.name;
        cat.type = def.type;
        cat.sortOrder = def.sortOrder;
        cat.isActive = true;
        await kindCatRepo.save(cat);
        console.log(`  Created kind category ${def.code} for tenant ${tenantId}`);
      }
      byCode[def.code] = cat;
    }

    const machineId = byCode['MACHINE']?.id;
    const buildingId = byCode['BUILDING']?.id;
    const generalId = byCode['GENERAL']?.id;
    if (!machineId || !buildingId || !generalId) {
      console.warn(`Missing kind category for tenant ${tenantId}, skipping backfill.`);
      continue;
    }

    await ccRepo
      .createQueryBuilder()
      .update(CostCenterEntity)
      .set({ kindCategoryId: machineId })
      .where('tenant_id = :tenantId', { tenantId })
      .andWhere('kind = :kind', { kind: 'MACHINE' })
      .execute();
    await ccRepo
      .createQueryBuilder()
      .update(CostCenterEntity)
      .set({ kindCategoryId: buildingId })
      .where('tenant_id = :tenantId', { tenantId })
      .andWhere('kind = :kind', { kind: 'BUILDING' })
      .execute();
    await ccRepo
      .createQueryBuilder()
      .update(CostCenterEntity)
      .set({ kindCategoryId: generalId })
      .where('tenant_id = :tenantId', { tenantId })
      .andWhere('kind = :kind', { kind: 'GENERAL' })
      .execute();
  }

  console.log('Migration completed.');
  await AppDataSource.destroy();
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
