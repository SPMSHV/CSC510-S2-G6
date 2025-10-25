import { pool } from './client';
import fs from 'fs';
import path from 'path';

async function migrate() {
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('Migration completed');
  process.exit(0);
}

migrate().catch(console.error);
