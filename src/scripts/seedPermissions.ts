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
 * Seed script to initialize all permissions and default role permissions
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

    console.log(`📦 Creating ${entityTypes.length} × ${actions.length} = ${entityTypes.length * actions.length} permissions...`);

    // Create all permissions (43 entities × 4 actions = 172 permissions)
    const permissions: Permission[] = [];
    
    for (const entity of entityTypes) {
      for (const action of actions) {
        const description = generatePermissionDescription(entity, action);
        const permission = Permission.create(entity, action, description);
        permissions.push(permission);
      }
    }

    // Save all permissions
    await permissionRepo.saveMany(permissions);
    console.log(`✅ Created ${permissions.length} permissions`);

    // Create a map of permission keys to IDs for easy lookup
    const permissionMap = new Map<string, string>();
    for (const permission of permissions) {
      permissionMap.set(permission.getKey(), permission.getId());
    }

    // Configure default permissions for each role
    console.log('🔐 Configuring default role permissions...');

    // SUPER_ADMIN: All permissions
    const superAdminPermissions = permissions.map(p => 
      RolePermission.create(UserRole.SUPER_ADMIN, p.getId(), null)
    );
    await rolePermissionRepo.saveMany(superAdminPermissions);
    console.log(`✅ SUPER_ADMIN: ${superAdminPermissions.length} permissions`);

    // ORG_ADMIN: All permissions except managing ORGANIZATION and USER entities
    const orgAdminExcludedEntities = [EntityType.ORGANIZATION];
    const orgAdminPermissions = permissions
      .filter(p => {
        // Exclude ORGANIZATION management completely
        if (p.getEntity() === EntityType.ORGANIZATION) {
          return false;
        }
        
        // For USER entity, only allow VIEW and EDIT (no CREATE or DELETE)
        if (p.getEntity() === EntityType.USER) {
          return p.getAction() === PermissionAction.VIEW || p.getAction() === PermissionAction.EDIT;
        }
        
        return true;
      })
      .map(p => RolePermission.create(UserRole.ORG_ADMIN, p.getId(), null));
    
    await rolePermissionRepo.saveMany(orgAdminPermissions);
    console.log(`✅ ORG_ADMIN: ${orgAdminPermissions.length} permissions`);

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

    const userPermissions = permissions
      .filter(p => {
        const entity = p.getEntity();
        const action = p.getAction();
        
        // Full CRUD access to main entities
        if (userReadOnlyEntities.includes(entity)) {
          return true;
        }
        
        // Read-only access to system/reference entities
        if (userReadOnlySystemEntities.includes(entity)) {
          return action === PermissionAction.VIEW;
        }
        
        return false;
      })
      .map(p => RolePermission.create(UserRole.USER, p.getId(), null));
    
    await rolePermissionRepo.saveMany(userPermissions);
    console.log(`✅ USER: ${userPermissions.length} permissions`);

    console.log('🎉 Permission seeding completed successfully!');
    console.log(`
📊 Summary:
   - Total Permissions: ${permissions.length}
   - SUPER_ADMIN: ${superAdminPermissions.length} permissions (full access)
   - ORG_ADMIN: ${orgAdminPermissions.length} permissions (limited)
   - USER: ${userPermissions.length} permissions (restricted)
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
