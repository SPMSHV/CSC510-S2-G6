import request from 'supertest';
import { createApp } from './helpers/request';

const app = createApp();

describe('Robots API', () => {
  it('lists empty robots initially', async () => {
    const res = await request(app).get('/api/robots');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('creates a robot and fetches health', async () => {
    const payload = {
      robotId: 'RB-07',
      status: 'IDLE',
      batteryPercent: 95,
      location: { lat: 35.0, lng: -78.0 },
    };
    const res = await request(app).post('/api/robots').send(payload);
    expect(res.status).toBe(201);

    const health = await request(app).get(`/api/robots/${res.body.id}/health`);
    expect(health.status).toBe(200);
    expect(health.body.id).toBe('RB-07');
    expect(typeof health.body.battery_pct).toBe('number');
  });

  it('updates robot status', async () => {
    const create = await request(app)
      .post('/api/robots')
      .send({ robotId: 'RB-08', status: 'IDLE', batteryPercent: 50, location: { lat: 0, lng: 0 } });
    const id = create.body.id;
    const patch = await request(app).patch(`/api/robots/${id}`).send({ status: 'EN_ROUTE' });
    expect(patch.status).toBe(200);
    expect(patch.body.status).toBe('EN_ROUTE');
  });

  it('returns 404 for non-existing robot', async () => {
    const res = await request(app).get('/api/robots/nonexistent');
    expect(res.status).toBe(404);
  });
});
