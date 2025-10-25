import { pool } from './client';

async function rollback() {
  await pool.query('DROP TABLE IF EXISTS orders CASCADE');');
  await pool.query('DROP TABLE IF EXISTS robots CASCADE');');
  await pool.query('DROP TABLE IF EXISTS users CASCADE');');
  console.log('Rollback completed');
  process.exit(0);
}

rollback().catch(console.error);
