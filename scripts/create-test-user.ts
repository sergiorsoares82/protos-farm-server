#!/usr/bin/env tsx

/**
 * Script to create a test user
 * Run: npx tsx scripts/create-test-user.ts
 */

import { initializeDatabase } from '../src/infrastructure/database/typeorm.config.js';
import { UserRepository } from '../src/infrastructure/repositories/UserRepository.js';
import { User } from '../src/domain/entities/User.js';

async function createTestUser() {
  console.log('Creating test user...\n');

  try {
    // Initialize database
    await initializeDatabase();

    // Create repository
    const userRepository = new UserRepository();

    // Check if user already exists
    const existingUser = await userRepository.findByEmail('test@example.com');
    if (existingUser) {
      console.log('✅ Test user already exists!');
      console.log(`   Email: test@example.com`);
      console.log(`   Password: Test1234!`);
      console.log(`   User ID: ${existingUser.getId()}\n`);
      process.exit(0);
    }

    // Create new user
    const user = await User.create('test@example.com', 'Test1234!');
    await userRepository.save(user);

    console.log('✅ Test user created successfully!');
    console.log(`   Email: test@example.com`);
    console.log(`   Password: Test1234!`);
    console.log(`   User ID: ${user.getId()}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
