import dotenv from 'dotenv';
import { runSqlFile } from './client';

dotenv.config();

async function main() {
  const backend = process.env.DATA_BACKEND || 'memory';
  if (backend === 'postgres') {
     
    console.log('Applying PostgreSQL schema...');
    await runSqlFile('db/schema.sql');
     
    console.log('Schema applied.');
  } else {
     
    console.log('Migrations complete (no-op for in-memory backend).');
  }
}

main().catch((e) => {
   
  console.error(e);
  process.exit(1);
});
