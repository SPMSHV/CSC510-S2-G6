import request from 'supertest';
import { createApp } from './helpers/request';

const app = createApp();

describe('Users API', () => {
  it('lists empty users initially', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('creates a user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'student@university.edu', name: 'Student', role: 'STUDENT' });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('student@university.edu');
  });

  it('rejects invalid user', async () => {
    const res = await request(app).post('/api/users').send({});
    expect(res.status).toBe(400);
  });

  it('updates a user', async () => {
    const create = await request(app)
      .post('/api/users')
      .send({ email: 'eng@university.edu', name: 'Eng', role: 'ENGINEER' });
    const id = create.body.id;
    const patch = await request(app).patch(`/api/users/${id}`).send({ name: 'Engineer' });
    expect(patch.status).toBe(200);
    expect(patch.body.name).toBe('Engineer');
  });

  it('returns 404 for non-existing user', async () => {
    const res = await request(app).get('/api/users/nonexistent');
    expect(res.status).toBe(404);
  });
});
