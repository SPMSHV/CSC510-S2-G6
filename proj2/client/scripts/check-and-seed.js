import { spawn } from 'child_process';
import http from 'http';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';
const BACKEND_URL = API_URL.replace('/api', '');
const MAX_WAIT_ATTEMPTS = 30;
const WAIT_DELAY = 1000;

function checkServerReady() {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: 'localhost', port: 3000, path: '/health', method: 'GET' },
      (res) => {
        resolve(res.statusCode === 200);
      },
    );
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function waitForServer() {
  console.log('⏳ Waiting for backend server...');
  for (let i = 0; i < MAX_WAIT_ATTEMPTS; i++) {
    const ready = await checkServerReady();
    if (ready) {
      console.log('✓ Backend server is ready\n');
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, WAIT_DELAY));
  }
  return false;
}

async function checkIfSeeded() {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: 'localhost', port: 3000, path: '/api/restaurants', method: 'GET' },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const restaurants = JSON.parse(data);
            resolve(Array.isArray(restaurants) && restaurants.length > 0);
          } catch {
            resolve(false);
          }
        });
      },
    );
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function runSeed() {
  return new Promise((resolve, reject) => {
    console.log('🌱 Seeding database with sample data...');
    const seedProcess = spawn('npm', ['run', 'seed'], {
      stdio: 'inherit',
      shell: true,
      cwd: join(__dirname, '..', '..'),
    });

    seedProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Seed complete!\n');
        resolve();
      } else {
        reject(new Error(`Seed script exited with code ${code}`));
      }
    });
    seedProcess.on('error', reject);
  });
}

async function main() {
  // Wait for backend
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.log('⚠️  Backend server is not running.');
    console.log('   The frontend will start, but API calls will fail.');
    console.log('   To start the backend: cd .. && npm run dev\n');
    process.exit(0); // Don't block frontend startup
  }

  // Check if already seeded
  const isSeeded = await checkIfSeeded();
  if (!isSeeded) {
    try {
      await runSeed();
    } catch (error) {
      console.error('⚠️  Seed failed, but continuing...', error.message);
    }
  } else {
    console.log('✓ Database already has restaurants. Skipping seed.\n');
  }
}

main().catch((error) => {
  console.error('⚠️  Seed check failed:', error.message);
  console.log('   Continuing with frontend startup...\n');
  process.exit(0); // Don't block frontend startup
});

