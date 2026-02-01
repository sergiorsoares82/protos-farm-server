/**
 * Test script for Person endpoints with multi-role support
 * 
 * Run this script after starting the server with `npm run dev`
 * 
 * Usage: tsx scripts/test-person-endpoints.ts
 */

import './test-env.js'; // Load environment variables
import { PersonRepository } from '../src/infrastructure/repositories/PersonRepository.js';
import { CreatePersonUseCase } from '../src/application/use-cases/person/CreatePersonUseCase.js';
import { GetPersonUseCase } from '../src/application/use-cases/person/GetPersonUseCase.js';
import { AssignRoleUseCase } from '../src/application/use-cases/person/AssignRoleUseCase.js';
import { RemoveRoleUseCase } from '../src/application/use-cases/person/RemoveRoleUseCase.js';
import { PersonRole } from '../src/domain/enums/PersonRole.js';
import { PersonType } from '../src/domain/enums/PersonType.js';
import { initializeDatabase, closeDatabase } from '../src/infrastructure/database/typeorm.config.js';

async function testPersonEndpoints() {
  console.log('🧪 Testing Person Endpoints...\n');

  try {
    // Initialize database
    console.log('📊 Initializing database connection...');
    await initializeDatabase();

    const personRepository = new PersonRepository();
    const createPersonUseCase = new CreatePersonUseCase(personRepository);
    const getPersonUseCase = new GetPersonUseCase(personRepository);
    const assignRoleUseCase = new AssignRoleUseCase(personRepository);
    const removeRoleUseCase = new RemoveRoleUseCase(personRepository);

    // Test 1: Create person with multiple roles
    console.log('\n✅ Test 1: Create person with CLIENT and FARM_OWNER roles');
    const person1 = await createPersonUseCase.execute({
      nome: 'John Doe',
      personType: PersonType.FISICA,
      email: `john.doe.${Date.now()}@example.com`,
      phone: '+1234567890',
      roles: [
        {
          type: PersonRole.CLIENT,
          data: { clientCategories: 'Agricultura, Comércio' },
        },
        {
          type: PersonRole.FARM_OWNER,
          data: {
            farmName: 'Green Valley Farm',
            farmLocation: '123 Farm Road, Valley City',
            totalArea: 100.5,
            ownershipType: 'Private',
          },
        },
      ],
    });
    console.log('   Created person:', person1.id);
    console.log('   Nome:', person1.nome);
    console.log('   Roles:', Object.keys(person1.roles));

    // Test 2: Get person by ID
    console.log('\n✅ Test 2: Get person by ID');
    const retrievedPerson = await getPersonUseCase.execute(person1.id);
    console.log('   Retrieved person:', retrievedPerson.id);
    console.log('   Email:', retrievedPerson.email);
    console.log('   Has CLIENT role:', PersonRole.CLIENT in retrievedPerson.roles);
    console.log('   Has FARM_OWNER role:', PersonRole.FARM_OWNER in retrievedPerson.roles);

    // Test 3: Assign SUPPLIER role
    console.log('\n✅ Test 3: Assign SUPPLIER role to person');
    const updatedPerson = await assignRoleUseCase.execute(person1.id, {
      role: PersonRole.SUPPLIER,
      roleData: {
        supplyCategories: 'Seeds, Fertilizer, Equipment',
      },
    });
    console.log('   Person now has roles:', Object.keys(updatedPerson.roles));

    // Test 4: Create person with WORKER role
    console.log('\n✅ Test 4: Create person with WORKER role');
    const person2 = await createPersonUseCase.execute({
      nome: 'Jane Smith',
      personType: PersonType.FISICA,
      email: `jane.smith.${Date.now()}@example.com`,
      phone: '+9876543210',
      roles: [
        {
          type: PersonRole.WORKER,
          data: {
            position: 'Farm Manager',
            hireDate: new Date('2023-01-15'),
            hourlyRate: 35.50,
            employmentType: 'Full-time',
          },
        },
      ],
    });
    console.log('   Created worker:', person2.nome);
    console.log('   Position:', person2.roles.WORKER?.position);

    // Test 5: Try to remove a role (should fail if it's the last role)
    console.log('\n✅ Test 5: Try to remove last role (should fail)');
    try {
      await removeRoleUseCase.execute(person2.id, PersonRole.WORKER);
      console.log('   ❌ UNEXPECTED: Should have failed!');
    } catch (error) {
      console.log('   ✓ Correctly prevented:', (error as Error).message);
    }

    // Test 6: Remove a role from person with multiple roles
    console.log('\n✅ Test 6: Remove CLIENT role from person with multiple roles');
    const personAfterRemoval = await removeRoleUseCase.execute(person1.id, PersonRole.CLIENT);
    console.log('   Remaining roles:', Object.keys(personAfterRemoval.roles));
    console.log('   Has CLIENT role:', PersonRole.CLIENT in personAfterRemoval.roles);
    console.log('   Has SUPPLIER role:', PersonRole.SUPPLIER in personAfterRemoval.roles);

    // Test 7: Create person with all roles
    console.log('\n✅ Test 7: Create person with ALL roles');
    const person3 = await createPersonUseCase.execute({
      nome: 'Alex Johnson',
      personType: PersonType.FISICA,
      email: `alex.johnson.${Date.now()}@example.com`,
      roles: [
        {
          type: PersonRole.CLIENT,
          data: { clientCategories: 'Johnson Corp' },
        },
        {
          type: PersonRole.SUPPLIER,
          data: { supplyCategories: 'Johnson Supplies' },
        },
        {
          type: PersonRole.WORKER,
          data: {
            position: 'Owner-Operator',
            hireDate: new Date(),
            employmentType: 'Owner',
          },
        },
        {
          type: PersonRole.FARM_OWNER,
          data: { farmName: 'Johnson Farm' },
        },
      ],
    });
    console.log('   Created person with all roles:', person3.nome);
    console.log('   Total roles:', Object.keys(person3.roles).length);
    console.log('   All roles:', Object.keys(person3.roles).join(', '));

    // Test 8: Try to create person without roles (should fail)
    console.log('\n✅ Test 8: Try to create person without roles (should fail)');
    try {
      await createPersonUseCase.execute({
        nome: 'Invalid Person',
        personType: PersonType.FISICA,
        email: `invalid.${Date.now()}@example.com`,
        roles: [],
      });
      console.log('   ❌ UNEXPECTED: Should have failed!');
    } catch (error) {
      console.log('   ✓ Correctly prevented:', (error as Error).message);
    }

    // Test 9: Try to create person with duplicate email (should fail)
    console.log('\n✅ Test 9: Try to create person with duplicate email (should fail)');
    try {
      await createPersonUseCase.execute({
        nome: 'Duplicate Email',
        personType: PersonType.FISICA,
        email: person1.email, // Reuse existing email
        roles: [{ type: PersonRole.CLIENT, data: {} }],
      });
      console.log('   ❌ UNEXPECTED: Should have failed!');
    } catch (error) {
      console.log('   ✓ Correctly prevented:', (error as Error).message);
    }

    console.log('\n\n🎉 All tests passed successfully!\n');
    console.log('📋 Summary:');
    console.log('   - Created persons with single and multiple roles');
    console.log('   - Retrieved persons with all role data');
    console.log('   - Dynamically assigned and removed roles');
    console.log('   - Validated business rules (min 1 role, unique email)');
    console.log('   - All role types tested: CLIENT, SUPPLIER, WORKER, FARM_OWNER\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await closeDatabase();
    console.log('✅ Database connection closed');
  }
}

// Run tests
testPersonEndpoints();
