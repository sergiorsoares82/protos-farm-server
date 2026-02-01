/**
 * Seed script: ensures the 4 system document types,
 * available to all organizations.
 *
 * System types: Nota Fiscal, Pedido, Recibo, Nota Avulsa.
 *
 * Run from server directory:
 *   npm run seed:document-types
 *   or: npx tsx src/scripts/seedDocumentTypes.ts
 */
import '../config/env.js';
import { AppDataSource, initializeDatabase } from '../infrastructure/database/typeorm.config.js';
import { DocumentTypeEntity } from '../infrastructure/database/entities/DocumentTypeEntity.js';
import { IsNull } from 'typeorm';

const SYSTEM_DOCUMENT_TYPES = [
  { name: 'Nota Fiscal', group: 'FISCAL', hasAccessKey: true },
  { name: 'Pedido', group: 'COMERCIAL', hasAccessKey: false },
  { name: 'Recibo', group: 'FINANCEIRO', hasAccessKey: false },
  { name: 'Nota Avulsa', group: 'FISCAL', hasAccessKey: true },
];

async function seedDocumentTypes() {
  try {
    console.log('🌱 Seeding system document types (available to all organizations)...');

    await initializeDatabase();

    const repo = AppDataSource.getRepository(DocumentTypeEntity);

    for (const def of SYSTEM_DOCUMENT_TYPES) {
      const existing = await repo.findOne({
        where: { name: def.name, tenantId: IsNull() },
      });

      if (!existing) {
        const entity = repo.create({
          id: crypto.randomUUID(),
          tenantId: null,
          name: def.name,
          group: def.group,
          hasAccessKey: def.hasAccessKey,
          isSystem: true,
        });
        await repo.save(entity);
        console.log(`  ✅ Created: ${def.name} (${def.group})`);
      } else {
        // Update existing to ensure isSystem is set
        if (!existing.isSystem) {
          existing.isSystem = true;
          await repo.save(existing);
          console.log(`  🔄 Updated: ${def.name} (${def.group}) - set as system type`);
        } else {
          console.log(`  ℹ️  Already exists: ${def.name} (${def.group})`);
        }
      }
    }
    
    // Verify all system types
    const allSystemTypes = await repo.find({
      where: { tenantId: IsNull(), isSystem: true },
    });
    console.log(`\n📊 Total system document types: ${allSystemTypes.length}`);
    allSystemTypes.forEach((dt) => {
      console.log(`   - ${dt.name} (${dt.group})`);
    });

    console.log('\n🎉 Done. System document types are ready.');
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

seedDocumentTypes();
