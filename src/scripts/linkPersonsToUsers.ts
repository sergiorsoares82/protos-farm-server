import { AppDataSource } from '../infrastructure/database/typeorm.config.js';
import { UserEntity } from '../infrastructure/database/entities/UserEntity.js';
import { PersonEntity } from '../infrastructure/database/entities/PersonEntity.js';

async function linkPersonsToUsers() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    
    const userRepo = AppDataSource.getRepository(UserEntity);
    const personRepo = AppDataSource.getRepository(PersonEntity);
    
    console.log('📋 Fetching users and persons...');
    
    // Get some users and persons to link
    const users = await userRepo.find({ 
      take: 10,
      order: { createdAt: 'ASC' }
    });
    
    const persons = await personRepo.find({ 
      where: { userId: null as any },
      take: 5,
      order: { createdAt: 'ASC' }
    });
    
    console.log(`Found ${users.length} users and ${persons.length} unlinked persons`);
    
    if (persons.length === 0) {
      console.log('⚠️  No unlinked persons found. All persons are already linked or no persons exist.');
      return;
    }
    
    // Link first few persons to users (one person per user)
    const linksToCreate = Math.min(users.length, persons.length);
    
    for (let i = 0; i < linksToCreate; i++) {
      const user = users[i];
      const person = persons[i];
      
      if (!user || !person) continue;
      
      // Only link if same tenant
      if (user.tenantId === person.tenantId) {
        person.userId = user.id;
        await personRepo.save(person);
        
        console.log(`✅ Linked person "${person.nome}" to user "${user.email}"`);
      } else {
        console.log(`⏭️  Skipped: person "${person.nome}" and user "${user.email}" have different tenants`);
      }
    }
    
    console.log('✅ Person-to-User linking completed!');
    
    // Show summary
    const linkedCount = await personRepo.count({ where: { userId: null as any } });
    const totalPersons = await personRepo.count();
    console.log(`\n📊 Summary:`);
    console.log(`   Total persons: ${totalPersons}`);
    console.log(`   Linked persons: ${totalPersons - linkedCount}`);
    console.log(`   Unlinked persons: ${linkedCount}`);
    
  } catch (error) {
    console.error('❌ Error linking persons to users:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('👋 Database connection closed');
  }
}

// Run the script
linkPersonsToUsers();
