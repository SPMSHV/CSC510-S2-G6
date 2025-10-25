import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'campusbot',
  user: process.env.DB_USER || 'campusbot',
  password: process.env.DB_PASSWORD || 'campusbot123',
});

export { pool };
