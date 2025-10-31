import { spawn, ChildProcess } from 'child_process';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const MAX_WAIT_ATTEMPTS = 30;
const WAIT_DELAY = 1000;

function checkServerReady(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: 'localhost', port: PORT, path: '/health', method: 'GET' },
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

async function waitForServer(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('⏳ Waiting for backend server to start...');
  for (let i = 0; i < MAX_WAIT_ATTEMPTS; i++) {
    const ready = await checkServerReady();
    if (ready) {
      // eslint-disable-next-line no-console
      console.log('✓ Backend server is ready\n');
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, WAIT_DELAY));
  }
  throw new Error('Backend server did not start in time');
}

async function runSeed(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('🌱 Running seed script...');
  const seedProcess = spawn('npm', ['run', 'seed'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..'),
  });

  return new Promise((resolve, reject) => {
    seedProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Seed script exited with code ${code}`));
      }
    });
    seedProcess.on('error', reject);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const startFrontend = args.includes('--frontend') || args.includes('-f');

  try {
    // Wait for backend
    await waitForServer();

    // Run seed
    await runSeed();

    // Optionally start frontend
    if (startFrontend) {
      // eslint-disable-next-line no-console
      console.log('\n🚀 Starting frontend development server...\n');
      const frontendProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true,
        cwd: path.join(__dirname, '..', 'client'),
      });

      frontendProcess.on('close', (code) => {
        process.exit(code || 0);
      });
    } else {
      // eslint-disable-next-line no-console
      console.log('\n✅ Seed complete! Backend is ready with sample data.');
      // eslint-disable-next-line no-console
      console.log('💡 To start the frontend, run: cd client && npm run dev');
      // eslint-disable-next-line no-console
      console.log('💡 Or run this script with --frontend flag to start both');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

