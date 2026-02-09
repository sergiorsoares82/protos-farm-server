/**
 * Migration script to unify Cost Centers, Machines, and Assets
 * 
 * This script migrates data from the old structure where:
 * - Machines had a 'name' field and optional 'assetId'
 * - Assets were separate entities
 * - Cost centers optionally linked to assets
 * 
 * To the new unified structure where:
 * - Cost centers are the main entity with 'name' and 'kind' fields
 * - Machines link to cost centers via 'costCenterId'
 * - Buildings are created for IMPROVEMENT assets
 * - Technical data is stored in specific tables (machines, buildings)
 */

// Load environment variables FIRST
import '../config/env.js';

import 'reflect-metadata';
import { AppDataSource, initializeDatabase } from '../infrastructure/database/typeorm.config.js';
import { CostCenterEntity } from '../infrastructure/database/entities/CostCenterEntity.js';
import { MachineEntity } from '../infrastructure/database/entities/MachineEntity.js';
import { AssetEntity } from '../infrastructure/database/entities/AssetEntity.js';
import { BuildingEntity } from '../infrastructure/database/entities/BuildingEntity.js';
import { CostCenterKind } from '../domain/enums/CostCenterKind.js';
import { AssetKind } from '../domain/enums/AssetKind.js';

async function migrateData() {
  console.log('🚀 Starting migration to unified cost center structure...\n');

  try {
    await initializeDatabase();
    const costCenterRepo = AppDataSource.getRepository(CostCenterEntity);
    const machineRepo = AppDataSource.getRepository(MachineEntity);
    const assetRepo = AppDataSource.getRepository(AssetEntity);
    const buildingRepo = AppDataSource.getRepository(BuildingEntity);

    let migratedMachines = 0;
    let migratedBuildings = 0;
    let updatedCostCenters = 0;

    // Step 1: Migrate machines with old 'name' field
    console.log('📋 Step 1: Migrating machines to new structure...');
    const machines = await machineRepo.find({ relations: ['costCenter'] });
    
    for (const machine of machines) {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // If machine has no cost center yet, create one
        if (!machine.costCenterId) {
          // Check if there's a name field (old structure)
          const oldName = (machine as any).name;
          if (oldName) {
            console.log(`  Creating cost center for machine: ${oldName}`);
            
            const costCenter = new CostCenterEntity();
            costCenter.tenantId = machine.tenantId;
            costCenter.code = `MAQ-${machine.id.substring(0, 8)}`;
            costCenter.name = oldName;
            costCenter.description = oldName;
            costCenter.kind = CostCenterKind.MACHINE;
            costCenter.type = 'PRODUCTIVE';
            costCenter.hasTechnicalData = true;
            costCenter.isActive = machine.isActive;

            const savedCostCenter = await queryRunner.manager.save(costCenter);

            // Update machine to link to cost center
            machine.costCenterId = savedCostCenter.id;
            await queryRunner.manager.save(machine);

            migratedMachines++;
          }
        }

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error(`  ❌ Error migrating machine ${machine.id}:`, error);
      } finally {
        await queryRunner.release();
      }
    }

    console.log(`✅ Migrated ${migratedMachines} machines\n`);

    // Step 2: Create cost centers + buildings for IMPROVEMENT assets
    console.log('📋 Step 2: Migrating IMPROVEMENT assets to buildings...');
    const improvementAssets = await assetRepo.find({ 
      where: { assetKind: AssetKind.IMPROVEMENT },
    });

    for (const asset of improvementAssets) {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Check if there's already a cost center linked to this asset
        let costCenter = await costCenterRepo.findOne({
          where: { asset: { id: asset.id }, tenantId: asset.tenantId },
        });

        if (!costCenter) {
          console.log(`  Creating cost center for building: ${asset.name}`);
          
          costCenter = new CostCenterEntity();
          costCenter.tenantId = asset.tenantId;
          costCenter.code = asset.code || `BEN-${asset.id.substring(0, 8)}`;
          costCenter.name = asset.name;
          costCenter.description = asset.name;
          costCenter.kind = CostCenterKind.BUILDING;
          costCenter.type = 'PRODUCTIVE';
          costCenter.hasTechnicalData = true;
          costCenter.isActive = asset.isActive;

          costCenter = await queryRunner.manager.save(costCenter);
        } else {
          // Update existing cost center to new structure
          costCenter.kind = CostCenterKind.BUILDING;
          costCenter.name = costCenter.name || asset.name;
          costCenter.hasTechnicalData = true;
          costCenter = await queryRunner.manager.save(costCenter);
          updatedCostCenters++;
        }

        // Check if building already exists
        const existingBuilding = await buildingRepo.findOne({
          where: { costCenterId: costCenter.id },
        });

        if (!existingBuilding) {
          const building = new BuildingEntity();
          building.tenantId = asset.tenantId;
          building.costCenterId = costCenter.id;
          building.isActive = asset.isActive;
          
          await queryRunner.manager.save(building);
          migratedBuildings++;
        }

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error(`  ❌ Error migrating asset ${asset.id}:`, error);
      } finally {
        await queryRunner.release();
      }
    }

    console.log(`✅ Migrated ${migratedBuildings} buildings`);
    console.log(`✅ Updated ${updatedCostCenters} existing cost centers\n`);

    // Step 3: Update cost centers that don't have 'kind' set
    console.log('📋 Step 3: Updating cost centers with default kind...');
    const costCentersWithoutKind = await costCenterRepo.find({
      where: [
        { kind: '' as any },
        { kind: null as any },
      ],
    });

    for (const cc of costCentersWithoutKind) {
      cc.kind = CostCenterKind.GENERAL;
      await costCenterRepo.save(cc);
    }

    console.log(`✅ Updated ${costCentersWithoutKind.length} cost centers with GENERAL kind\n`);

    // Validation
    console.log('📋 Step 4: Validating migration...');
    const allMachines = await machineRepo.count();
    const machinesWithCostCenter = await machineRepo.count({ 
      where: { costCenterId: Not(null as any) },
    });
    const allBuildings = await buildingRepo.count();

    console.log(`\n📊 Migration Summary:`);
    console.log(`  Machines: ${allMachines} total, ${machinesWithCostCenter} with cost centers`);
    console.log(`  Buildings: ${allBuildings} total`);
    console.log(`  Cost centers updated: ${updatedCostCenters}`);
    
    if (machinesWithCostCenter < allMachines) {
      console.log(`\n⚠️  Warning: ${allMachines - machinesWithCostCenter} machines still without cost centers`);
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

// Import Not operator
import { Not } from 'typeorm';

// Run migration
migrateData().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
