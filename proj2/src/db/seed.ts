import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

function post(path: string, body: unknown): Promise<void> {
  const data = JSON.stringify(body);
  const req = http.request(
    { hostname: 'localhost', port: process.env.PORT || 3000, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
    (res) => {
      res.resume();
    },
  );
  return new Promise((resolve, reject) => {
    req.on('error', reject);
    req.on('close', () => resolve());
    req.write(data);
    req.end();
  });
}

async function main() {
  await post('/api/users', { email: 'student@university.edu', name: 'Student One', role: 'STUDENT' });
  await post('/api/robots', { robotId: 'RB-07', status: 'IDLE', batteryPercent: 90, location: { lat: 35.77, lng: -78.64 } });
  await post('/api/orders', {
    userId: 'student-1',
    vendorId: 'vendor-1',
    items: [
      { name: 'Maple Bacon Burger', quantity: 1, price: 12.5 },
      { name: 'Iced Tea', quantity: 1, price: 2.5 },
    ],
    deliveryLocation: 'Engineering Building, Room 201',
  });
  // eslint-disable-next-line no-console
  console.log('Seed complete');
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
