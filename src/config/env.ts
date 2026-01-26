import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env/.env BEFORE anything else
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Go up two levels: config/ -> src/ -> root/
dotenv.config({ path: join(__dirname, '../../.env/.env') });

// Log loaded env vars for debugging
console.log('🔧 Environment variables loaded:');
console.log(`  DB_HOST: ${process.env.DB_HOST}`);
console.log(`  DB_PORT: ${process.env.DB_PORT}`);
console.log(`  POSTGRES_USER: ${process.env.POSTGRES_USER}`);
console.log(`  POSTGRES_DB: ${process.env.POSTGRES_DB}`);
console.log(`  JWT_ACCESS_SECRET: ${process.env.JWT_ACCESS_SECRET ? '✓ Set' : '✗ Not set'}`);
console.log(`  JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? '✓ Set' : '✗ Not set'}`);
