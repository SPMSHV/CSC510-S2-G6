import { pool } from './client';

async function seed() {
  // Seed users
  await pool.query(
    'INSERT INTO users (email, name, role) VALUES (, , ) ON CONFLICT (email) DO NOTHING',
    ['student@university.edu', 'Student User', 'STUDENT']
  );

  await pool.query(
    'INSERT INTO users (email, name, role) VALUES (, , ) ON CONFLICT (email) DO NOTHING',
    ['vendor@university.edu', 'Vendor User', 'VENDOR']
  );

  // Seed robots
  await pool.query(
    'INSERT INTO robots (robot_id, status, battery_percent, location_lat, location_lng) VALUES (, , , , ) ON CONFLICT (robot_id) DO NOTHING',
    ['RB-001', 'IDLE', 85, 35.0, -78.0]
  );

  console.log('Seed completed');
  process.exit(0);
}

seed().catch(console.error);
