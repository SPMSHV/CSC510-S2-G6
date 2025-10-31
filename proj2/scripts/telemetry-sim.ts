import dotenv from 'dotenv';
dotenv.config();

// This script starts the API with telemetry simulator enabled.
// Usage: npm run dev:telemetry

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { spawn } = require('child_process');

process.env.ENABLE_TELEMETRY_SIM = '1';

const child = spawn('ts-node', ['src/index.ts'], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

child.on('exit', (code: number) => {
  process.exit(code ?? 0);
});


