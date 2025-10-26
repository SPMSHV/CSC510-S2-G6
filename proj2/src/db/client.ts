import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export function getPool(): Pool {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'campusbot',
  });
  return pool;
}

export async function runSqlFile(relativePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), relativePath);
  const sql = fs.readFileSync(fullPath, 'utf8');
  const pool = getPool();
  try {
    await pool.query(sql);
  } finally {
    await pool.end();
  }
}
