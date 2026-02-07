/**
 * Seed script to create system roles and assign default permissions
 * 
 * This script:
 * 1. Creates 3 system roles: SUPER_ADMIN, ORG_ADMIN, USER
 * 2. Optionally creates custom example roles
 * 
 * Run with: ts-node src/scripts/seedRoles.ts
 */

import '../config/env.js';
import { initializeDatabase } from '../infrastructure/database/typeorm.config.js';
import { RoleRepository } from '../infrastructure/repositories/RoleRepository.js';
import { Role } from '../domain/entities/Role.js';

async function seedRoles() {
  console.log('🌱 Starting role seeding...\n');

  try {
    // Initialize database connection
    await initializeDatabase();
    console.log('✅ Database connected\n');

    const roleRepository = new RoleRepository();

    const systemRolesToCreate = [
      {
        name: 'SUPER_ADMIN',
        displayName: 'Super Administrator',
        description: 'System administrator with full access to all features and organizations. Can manage all users, roles, and permissions.',
      },
      {
        name: 'ORG_ADMIN',
        displayName: 'Organization Administrator',
        description: 'Organization administrator with full access to their organization. Can manage users and USER role permissions within their organization.',
      },
      {
        name: 'USER',
        displayName: 'Standard User',
        description: 'Standard user with limited permissions. Access is controlled by the organization administrator.',
      },
    ];

    console.log('📝 Ensuring system roles exist...\n');

    for (const r of systemRolesToCreate) {
      const existing = await roleRepository.findByName(r.name);
      if (existing) {
        console.log(`⏭️  ${r.name} already exists, skipping`);
        continue;
      }
      const role = Role.createSystem(r.name, r.displayName, r.description);
      await roleRepository.save(role);
      console.log(`✅ Created: ${role.getName()} (${role.getDisplayName()})`);
      console.log(`   ID: ${role.getId()}`);
      console.log(`   System: ${role.getIsSystem()}, Can be deleted: ${role.getCanBeDeleted()}\n`);
    }

    // Optional: create example custom roles only if they don't exist
    const exampleCustomRoles = [
      { name: 'MANAGER', displayName: 'Manager', description: 'Manager role with elevated permissions for operational management' },
      { name: 'VIEWER', displayName: 'Viewer', description: 'Read-only role for viewing data without making changes' },
    ];

    console.log('📝 Ensuring example custom roles exist (optional)...\n');

    for (const r of exampleCustomRoles) {
      const existing = await roleRepository.findByName(r.name);
      if (existing) {
        console.log(`⏭️  ${r.name} already exists, skipping`);
        continue;
      }
      const role = Role.createCustom(r.name, r.displayName, r.description);
      await roleRepository.save(role);
      console.log(`✅ Created: ${role.getName()} (${role.getDisplayName()})`);
      console.log(`   ID: ${role.getId()}\n`);
    }

    // Summary
    const allRoles = await roleRepository.findAll();
    const systemRoles = await roleRepository.findSystemRoles();
    const customRoles = await roleRepository.findCustomRoles();

    console.log('📊 Summary:');
    console.log(`   Total roles: ${allRoles.length}`);
    console.log(`   System roles: ${systemRoles.length} (cannot be deleted)`);
    console.log(`   Custom roles: ${customRoles.length} (can be deleted if not assigned)\n`);

    console.log('✅ Role seeding completed successfully!\n');
    console.log('💡 Next steps:');
    console.log('   1. Run permission seeding: ts-node src/scripts/seedPermissions.ts');
    console.log('   2. Assign permissions to roles via the Permission Management UI');
    console.log('   3. Create users and assign them roles\n');

  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }

  process.exit(0);
}

// Run seed
seedRoles();
