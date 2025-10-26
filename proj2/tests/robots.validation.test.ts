import request from 'supertest';
import { createApp } from './helpers/request';

const app = createApp();

describe('Robots API - validation', () => {
  const invalidCreate = [
    {},
    { robotId: 'RB-1' },
    { status: 'IDLE' },
    { batteryPercent: 10 },
    { location: { lat: 0, lng: 0 } },
    { robotId: 'RB-1', status: 'IDLE', batteryPercent: -1, location: { lat: 0, lng: 0 } },
    { robotId: 'RB-1', status: 'X', batteryPercent: 10, location: { lat: 0, lng: 0 } },
    { robotId: 'RB-1', status: 'IDLE', batteryPercent: 200, location: { lat: 0, lng: 0 } },
    { robotId: 'RB-1', status: 'IDLE', batteryPercent: 10, location: { lat: 'x', lng: 0 } },
    { robotId: 'RB-1', status: 'IDLE', batteryPercent: 10, location: { lat: 0, lng: 'y' } },
  ];

  test.each(invalidCreate.map((p, i) => [i, p]))('rejects invalid robot create %p', async (_i, payload) => {
    const res = await request(app).post('/api/robots').send(payload as any);
    expect(res.status).toBe(400);
  });

  const statuses = ['IDLE', 'ASSIGNED', 'EN_ROUTE', 'CHARGING', 'MAINTENANCE', 'OFFLINE'] as const;

  test.each(statuses.map((s) => [s]))('creates robot with status %p and updates battery', async (s) => {
    const create = await request(app)
      .post('/api/robots')
      .send({ robotId: `RB-${s}`, status: s, batteryPercent: 50, location: { lat: 1, lng: 2 } });
    const id = create.body.id;
    const patch = await request(app).patch(`/api/robots/${id}`).send({ batteryPercent: 75 });
    expect(patch.status).toBe(200);
    expect(patch.body.batteryPercent).toBe(75);
  });

  const n = Array.from({ length: 20 }).map((_, i) => i + 1);
  test.each(n.map((i) => [i]))('creates robot variant #%p', async (i) => {
    const res = await request(app)
      .post('/api/robots')
      .send({ robotId: `RB-${i}`, status: 'IDLE', batteryPercent: (i * 7) % 100, location: { lat: i, lng: -i } });
    expect(res.status).toBe(201);
  });
});
