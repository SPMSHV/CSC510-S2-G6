import request from 'supertest';
import { createApp } from './helpers/request';

const app = createApp();

describe('Health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
