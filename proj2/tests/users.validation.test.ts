import request from 'supertest';
import { createApp } from './helpers/request';

const app = createApp();

describe('Users API - validation', () => {
  const invalidUsers = [
    {},
    { email: 'not-an-email', name: 'x', role: 'STUDENT' },
    { email: 'a@b.com', role: 'STUDENT' },
    { email: 'a@b.com', name: 'x' },
    { email: 'a@b.com', name: 'x', role: 'UNKNOWN' },
  ];

  test.each(invalidUsers.map((p, i) => [i, p]))('rejects invalid user create %p', async (_i, payload) => {
    const res = await request(app).post('/api/users').send(payload as any);
    expect(res.status).toBe(400);
  });

  const roles = ['STUDENT', 'VENDOR', 'ADMIN', 'ENGINEER'] as const;
  test.each(roles.map((r) => [r]))('creates user with role %p', async (role) => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: `${role.toLowerCase()}@u.edu`, name: `${role}-User`, role });
    expect(res.status).toBe(201);
  });

  const n = Array.from({ length: 25 }).map((_, i) => i + 1);
  test.each(n.map((i) => [i]))('updates user variant #%p', async (i) => {
    const create = await request(app)
      .post('/api/users')
      .send({ email: `u${i}@u.edu`, name: `User ${i}`, role: 'STUDENT' });
    const id = create.body.id;
    const patch = await request(app).patch(`/api/users/${id}`).send({ name: `User ${i}X` });
    expect(patch.status).toBe(200);
    expect(patch.body.name).toBe(`User ${i}X`);
  });
});
