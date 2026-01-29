import { AppDataSource, initializeDatabase } from '../infrastructure/database/typeorm.config.js';
import { OrganizationEntity } from '../infrastructure/database/entities/OrganizationEntity.js';
import { UserEntity } from '../infrastructure/database/entities/UserEntity.js';
import { ManagementAccountEntity } from '../infrastructure/database/entities/ManagementAccountEntity.js';
import { CostCenterCategoryEntity } from '../infrastructure/database/entities/CostCenterCategoryEntity.js';
import { AccountType } from '../domain/enums/AccountType.js';
import { Password } from '../domain/value-objects/Password.js';
import { UserRole } from '../domain/enums/UserRole.js';

/**
 * Seed script to create test organizations and users
 * Run with: npm run ts-node src/scripts/seedOrganizations.ts
 */
async function seedOrganizations() {
  try {
    console.log('🌱 Starting organization seeding...');
    
    // Initialize database connection
    await initializeDatabase();
    
    const orgRepo = AppDataSource.getRepository(OrganizationEntity);
    const userRepo = AppDataSource.getRepository(UserEntity);
    const accountRepo = AppDataSource.getRepository(ManagementAccountEntity);
    const categoryRepo = AppDataSource.getRepository(CostCenterCategoryEntity);
    
    // Check if organizations already exist
    const existingOrgs = await orgRepo.count();
    if (existingOrgs > 0) {
      console.log('ℹ️  Organizations already exist. Skipping seeding.');
      console.log(`Found ${existingOrgs} organization(s).`);
      
      // List existing organizations
      const orgs = await orgRepo.find();
      const users = await userRepo.find();
      
      console.log('\n📋 Existing Organizations:');
      for (const org of orgs) {
        const orgUsers = users.filter(u => u.tenantId === org.id);
        console.log(`  - ${org.name} (${org.slug})`);
        for (const user of orgUsers) {
          console.log(`    └─ ${user.email}`);
        }
      }
      console.log('\n💡 To reset, run: docker-compose down -v && docker-compose up -d');
      await AppDataSource.destroy();
      process.exit(0);
    }
    
    // Create super admin (assigned to first org for tenant context)
    const superAdminPassword = await Password.create('SuperAdmin@123!');
    const superAdmin = new UserEntity();
    superAdmin.id = crypto.randomUUID();
    superAdmin.email = 'superadmin@protofarm.com';
    superAdmin.password = superAdminPassword.getHashedValue();
    superAdmin.role = UserRole.SUPER_ADMIN;
    
    // Create Organization 1: Acme Farm
    const org1 = new OrganizationEntity();
    org1.id = crypto.randomUUID();
    org1.name = 'Acme Farm';
    org1.slug = 'acme-farm';
    org1.isActive = true;
    await orgRepo.save(org1);
    console.log('✅ Created organization: Acme Farm (ID:', org1.id, ')');
    
    // Assign super admin to first org
    superAdmin.tenantId = org1.id;
    await userRepo.save(superAdmin);
    console.log('✅ Created super admin: superadmin@protofarm.com (Password: SuperAdmin@123!)');
    
    // Create org admin for Acme Farm
    const password1 = await Password.create('Admin@123!');
    const user1 = new UserEntity();
    user1.id = crypto.randomUUID();
    user1.tenantId = org1.id;
    user1.email = 'admin@acmefarm.com';
    user1.password = password1.getHashedValue();
    user1.role = UserRole.ORG_ADMIN;
    await userRepo.save(user1);
    console.log('✅ Created org admin: admin@acmefarm.com (Password: Admin@123!)');
    
    // Create regular user for Acme Farm
    const userPassword1 = await Password.create('User@123!');
    const regularUser1 = new UserEntity();
    regularUser1.id = crypto.randomUUID();
    regularUser1.tenantId = org1.id;
    regularUser1.email = 'user@acmefarm.com';
    regularUser1.password = userPassword1.getHashedValue();
    regularUser1.role = UserRole.USER;
    await userRepo.save(regularUser1);
    console.log('✅ Created regular user: user@acmefarm.com (Password: User@123!)');
    
    // Create Organization 2: Green Valley Farms
    const org2 = new OrganizationEntity();
    org2.id = crypto.randomUUID();
    org2.name = 'Green Valley Farms';
    org2.slug = 'green-valley-farms';
    org2.isActive = true;
    await orgRepo.save(org2);
    console.log('✅ Created organization: Green Valley Farms (ID:', org2.id, ')');
    
    // Create org admin for Green Valley Farms
    const password2 = await Password.create('Admin@123!');
    const user2 = new UserEntity();
    user2.id = crypto.randomUUID();
    user2.tenantId = org2.id;
    user2.email = 'admin@greenvalley.com';
    user2.password = password2.getHashedValue();
    user2.role = UserRole.ORG_ADMIN;
    await userRepo.save(user2);
    console.log('✅ Created org admin: admin@greenvalley.com (Password: Admin@123!)');
    
    // Create regular user for Green Valley Farms
    const userPassword2 = await Password.create('User@123!');
    const regularUser2 = new UserEntity();
    regularUser2.id = crypto.randomUUID();
    regularUser2.tenantId = org2.id;
    regularUser2.email = 'user@greenvalley.com';
    regularUser2.password = userPassword2.getHashedValue();
    regularUser2.role = UserRole.USER;
    await userRepo.save(regularUser2);
    console.log('✅ Created regular user: user@greenvalley.com (Password: User@123!)');
    
    // Create Organization 3: Sunrise Ranch
    const org3 = new OrganizationEntity();
    org3.id = crypto.randomUUID();
    org3.name = 'Sunrise Ranch';
    org3.slug = 'sunrise-ranch';
    org3.isActive = true;
    await orgRepo.save(org3);
    console.log('✅ Created organization: Sunrise Ranch (ID:', org3.id, ')');
    
    // Create org admin for Sunrise Ranch
    const password3 = await Password.create('Admin@123!');
    const user3 = new UserEntity();
    user3.id = crypto.randomUUID();
    user3.tenantId = org3.id;
    user3.email = 'admin@sunriseranch.com';
    user3.password = password3.getHashedValue();
    user3.role = UserRole.ORG_ADMIN;
    await userRepo.save(user3);
    console.log('✅ Created org admin: admin@sunriseranch.com (Password: Admin@123!)');
    
    // Create regular user for Sunrise Ranch
    const userPassword3 = await Password.create('User@123!');
    const regularUser3 = new UserEntity();
    regularUser3.id = crypto.randomUUID();
    regularUser3.tenantId = org3.id;
    regularUser3.email = 'user@sunriseranch.com';
    regularUser3.password = userPassword3.getHashedValue();
    regularUser3.role = UserRole.USER;
    await userRepo.save(regularUser3);
    console.log('✅ Created regular user: user@sunriseranch.com (Password: User@123!)');
    
    // Seed base Management Accounts for each organization
    const seedBaseAccountsAndCategories = async (tenantId: string, orgName: string) => {
      const existing = await accountRepo.count({ where: { tenantId } });
      if (existing === 0) {
        const income = new ManagementAccountEntity();
        income.tenantId = tenantId;
        income.code = '01';
        income.description = 'Income';
        income.type = AccountType.REVENUE;
        income.isActive = true;

        const expense = new ManagementAccountEntity();
        expense.tenantId = tenantId;
        expense.code = '02';
        expense.description = 'Expense';
        expense.type = AccountType.EXPENSE;
        expense.isActive = true;

        await accountRepo.save([income, expense]);
        console.log(`✅ Seeded base management accounts (01 Income, 02 Expense) for ${orgName}`);
      } else {
        console.log(
          `ℹ️  Management accounts already exist for ${orgName}, skipping base account seeding.`,
        );
      }

      const existingCategory = await categoryRepo.count({
        where: { tenantId, code: 'LAV' },
      });
      if (existingCategory === 0) {
        const lavouraCat = new CostCenterCategoryEntity();
        lavouraCat.tenantId = tenantId;
        lavouraCat.code = 'LAV';
        lavouraCat.name = 'Lavoura';
        lavouraCat.description = 'Categoria padrão para lavouras';
        lavouraCat.isActive = true;
        await categoryRepo.save(lavouraCat);
        console.log(`✅ Seeded default Lavoura cost center category for ${orgName}`);
      } else {
        console.log(
          `ℹ️  Lavoura cost center category already exists for ${orgName}, skipping seeding.`,
        );
      }
    };

    await seedBaseAccountsAndCategories(org1.id, 'Acme Farm');
    await seedBaseAccountsAndCategories(org2.id, 'Green Valley Farms');
    await seedBaseAccountsAndCategories(org3.id, 'Sunrise Ranch');

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📋 Test Users:');
    console.log('\n🛡️  Super Admin:');
    console.log('   - superadmin@protofarm.com (Password: SuperAdmin@123!)');
    console.log('   - Can manage ALL organizations and users');
    console.log('\n👔 Organization Admins:');
    console.log('   - admin@acmefarm.com (Acme Farm) - Password: Admin@123!');
    console.log('   - admin@greenvalley.com (Green Valley Farms) - Password: Admin@123!');
    console.log('   - admin@sunriseranch.com (Sunrise Ranch) - Password: Admin@123!');
    console.log('   - Can manage their organization and users');
    console.log('\n👤 Regular Users:');
    console.log('   - user@acmefarm.com (Acme Farm) - Password: User@123!');
    console.log('   - user@greenvalley.com (Green Valley Farms) - Password: User@123!');
    console.log('   - user@sunriseranch.com (Sunrise Ranch) - Password: User@123!');
    console.log('   - Can manage data within their organization');
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedOrganizations();
