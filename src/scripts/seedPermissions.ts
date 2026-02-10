import 'reflect-metadata';
import '../config/env.js';
import { AppDataSource, initializeDatabase } from '../infrastructure/database/typeorm.config.js';
import { PermissionRepository } from '../infrastructure/repositories/PermissionRepository.js';
import { RolePermissionRepository } from '../infrastructure/repositories/RolePermissionRepository.js';
import { Permission } from '../domain/entities/Permission.js';
import { RolePermission } from '../domain/entities/RolePermission.js';
import { EntityType } from '../domain/enums/EntityType.js';
import { PermissionAction } from '../domain/enums/PermissionAction.js';
import { UserRole } from '../domain/enums/UserRole.js';

/**
 * Seed script to initialize all permissions and default role permissions.
 * Idempotent: only creates missing (entity, action) permissions and missing role-permission links.
 */
async function seedPermissions() {
  try {
    console.log('🌱 Starting permission seeding...');
    
    // Initialize database connection
    await initializeDatabase();
    
    const permissionRepo = new PermissionRepository();
    const rolePermissionRepo = new RolePermissionRepository();

    // Get all entity types and actions
    const entityTypes = Object.values(EntityType);
    const actions = Object.values(PermissionAction);

    // Load existing permissions and build map (key -> id)
    const existingPermissions = await permissionRepo.findAll();
    const permissionMap = new Map<string, string>();
    const permissions: Permission[] = [...existingPermissions];
    for (const p of existingPermissions) {
      permissionMap.set(p.getKey(), p.getId());
    }

    // Create only missing permissions
    let created = 0;
    for (const entity of entityTypes) {
      for (const action of actions) {
        const key = `${entity}:${action}`;
        if (permissionMap.has(key)) continue;
        const description = generatePermissionDescription(entity, action);
        const permission = Permission.create(entity, action, description);
        await permissionRepo.save(permission);
        permissionMap.set(key, permission.getId());
        permissions.push(permission);
        created++;
      }
    }
    console.log(`📦 Permissions: ${existingPermissions.length} existing, ${created} created (${permissions.length} total)`);

    // Configure default permissions for each role (only insert missing links)
    console.log('🔐 Configuring default role permissions...');

    const existingByRole = async (role: UserRole) => {
      const list = await rolePermissionRepo.findByRole(role);
      return new Set(list.map(rp => rp.getPermissionId()));
    };

    // SUPER_ADMIN: All permissions
    const superAdminExisting = await existingByRole(UserRole.SUPER_ADMIN);
    const superAdminPermissions = permissions
      .filter(p => !superAdminExisting.has(p.getId()))
      .map(p => RolePermission.create(UserRole.SUPER_ADMIN, p.getId(), null));
    if (superAdminPermissions.length > 0) {
      await rolePermissionRepo.saveMany(superAdminPermissions);
    }
    console.log(`✅ SUPER_ADMIN: ${superAdminPermissions.length} new, ${superAdminExisting.size} existing`);

    // ORG_ADMIN: All permissions except managing ORGANIZATION and USER entities
    const orgAdminPermsList = permissions.filter(p => {
      if (p.getEntity() === EntityType.ORGANIZATION) return false;
      if (p.getEntity() === EntityType.USER) {
        return p.getAction() === PermissionAction.VIEW || p.getAction() === PermissionAction.EDIT;
      }
      return true;
    });
    const orgAdminExisting = await existingByRole(UserRole.ORG_ADMIN);
    const orgAdminPermissions = orgAdminPermsList
      .filter(p => !orgAdminExisting.has(p.getId()))
      .map(p => RolePermission.create(UserRole.ORG_ADMIN, p.getId(), null));
    if (orgAdminPermissions.length > 0) {
      await rolePermissionRepo.saveMany(orgAdminPermissions);
    }
    console.log(`✅ ORG_ADMIN: ${orgAdminPermissions.length} new, ${orgAdminExisting.size} existing`);

    // USER: Read-only access to most entities, limited write access
    const userReadOnlyEntities = [
      // Core (read-only)
      EntityType.ORGANIZATION,
      EntityType.USER,
      
      // Person/Party (full access)
      EntityType.PERSON,
      EntityType.CLIENT,
      EntityType.SUPPLIER,
      EntityType.WORKER,
      EntityType.FARM_OWNER,
      
      // Farm/Property (full access except ownership records)
      EntityType.FARM,
      EntityType.RURAL_PROPERTY,
      EntityType.FARM_RURAL_PROPERTY,
      EntityType.LAND_REGISTRY,
      EntityType.STATE_REGISTRATION,
      EntityType.STATE_REGISTRATION_PARTICIPANT,
      EntityType.STATE_REGISTRATION_LAND_REGISTRY,
      
      // Field/Season (full access)
      EntityType.FIELD,
      EntityType.FIELD_SEASON,
      EntityType.SEASON,
      
      // Financial (full access)
      EntityType.BANK_ACCOUNT,
      EntityType.COST_CENTER,
      EntityType.COST_CENTER_CATEGORY,
      EntityType.COST_CENTER_KIND_CATEGORY,
      EntityType.MANAGEMENT_ACCOUNT,
      
      // Invoice (full access)
      EntityType.INVOICE,
      EntityType.INVOICE_ITEM,
      EntityType.INVOICE_FINANCIAL,
      EntityType.INVOICE_RECEIPT,
      EntityType.INVOICE_RECEIPT_ITEM,
      EntityType.INVOICE_SHIPMENT,
      EntityType.INVOICE_SHIPMENT_ITEM,
      
      // Asset/Machine (full access)
      EntityType.ASSET,
      EntityType.MACHINE,
      
      // Inventory/Product (full access)
      EntityType.ITEM,
      EntityType.PRODUCT,
      EntityType.STOCK_MOVEMENT,
    ];

    const userReadOnlySystemEntities = [
      EntityType.ACTIVITY_TYPE,
      EntityType.OPERATION,
      EntityType.DOCUMENT_TYPE,
      EntityType.INVOICE_FINANCIALS_TYPE,
      EntityType.MACHINE_TYPE,
      EntityType.STOCK_MOVEMENT_TYPE,
      EntityType.UNIT_OF_MEASURE,
      EntityType.UNIT_OF_MEASURE_CONVERSION,
      EntityType.WORK_LOCATION_TYPE,
      EntityType.PROPERTY_OWNERSHIP,
      EntityType.MANAGEMENT_ACCOUNT_COST_CENTER_TYPE,
    ];

    const userPermsList = permissions.filter(p => {
      const entity = p.getEntity();
      const action = p.getAction();
      if (userReadOnlyEntities.includes(entity)) return true;
      if (userReadOnlySystemEntities.includes(entity)) return action === PermissionAction.VIEW;
      return false;
    });
    const userExisting = await existingByRole(UserRole.USER);
    const userPermissions = userPermsList
      .filter(p => !userExisting.has(p.getId()))
      .map(p => RolePermission.create(UserRole.USER, p.getId(), null));
    if (userPermissions.length > 0) {
      await rolePermissionRepo.saveMany(userPermissions);
    }
    console.log(`✅ USER: ${userPermissions.length} new, ${userExisting.size} existing`);

    console.log('🎉 Permission seeding completed successfully!');
    const superAdminTotal = superAdminExisting.size + superAdminPermissions.length;
    const orgAdminTotal = orgAdminExisting.size + orgAdminPermissions.length;
    const userTotal = userExisting.size + userPermissions.length;
    console.log(`
📊 Summary:
   - Total Permissions: ${permissions.length}
   - SUPER_ADMIN: ${superAdminTotal} total (${superAdminPermissions.length} newly linked)
   - ORG_ADMIN: ${orgAdminTotal} total (${orgAdminPermissions.length} newly linked)
   - USER: ${userTotal} total (${userPermissions.length} newly linked)
    `);

  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

/**
 * Generate a human-readable description for a permission
 */
function generatePermissionDescription(entity: EntityType, action: PermissionAction): string {
  const entityName = entity
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
  
  const actionVerb = {
    [PermissionAction.VIEW]: 'View',
    [PermissionAction.CREATE]: 'Create',
    [PermissionAction.EDIT]: 'Edit',
    [PermissionAction.DELETE]: 'Delete',
  }[action];

  return `${actionVerb} ${entityName}`;
}

// Run the seed script
seedPermissions()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
