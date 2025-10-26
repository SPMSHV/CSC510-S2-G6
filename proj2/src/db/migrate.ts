import dotenv from 'dotenv';
import { runSqlFile } from './client';

dotenv.config();

async function main() {
  const backend = process.env.DATA_BACKEND || 'memory';
  if (backend === 'postgres') {
    // eslint-disable-next-line no-console
    console.log('Applying PostgreSQL schema...');
    await runSqlFile('db/schema.sql');
    // eslint-disable-next-line no-console
    console.log('Schema applied.');
  } else {
    // eslint-disable-next-line no-console
    console.log('Migrations complete (no-op for in-memory backend).');
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
