import request from 'supertest';
import { createApp } from './helpers/request';

const app = createApp();

describe('Orders API', () => {
  it('lists empty orders initially', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('creates an order and computes total', async () => {
    const payload = {
      userId: 'user-1',
      vendorId: 'vendor-1',
      items: [
        { name: 'Burger', quantity: 1, price: 10 },
        { name: 'Fries', quantity: 2, price: 3 },
      ],
      deliveryLocation: 'Building A',
    };
    const res = await request(app).post('/api/orders').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(16);
    expect(res.body.status).toBe('CREATED');

    const getRes = await request(app).get(`/api/orders/${res.body.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(res.body.id);
  });

  it('rejects invalid order', async () => {
    const res = await request(app).post('/api/orders').send({});
    expect(res.status).toBe(400);
  });

  it('updates order status', async () => {
    const create = await request(app)
      .post('/api/orders')
      .send({ userId: 'u', vendorId: 'v', items: [{ name: 'x', quantity: 1, price: 1 }], deliveryLocation: 'loc' });
    const id = create.body.id;
    const patch = await request(app).patch(`/api/orders/${id}`).send({ status: 'PREPARING' });
    expect(patch.status).toBe(200);
    expect(patch.body.status).toBe('PREPARING');
  });

  it('returns 404 for non-existing order', async () => {
    const res = await request(app).get('/api/orders/nonexistent');
    expect(res.status).toBe(404);
  });

  it('deletes an order', async () => {
    const create = await request(app)
      .post('/api/orders')
      .send({ userId: 'u', vendorId: 'v', items: [{ name: 'x', quantity: 1, price: 1 }], deliveryLocation: 'loc' });
    const id = create.body.id;
    const del = await request(app).delete(`/api/orders/${id}`);
    expect(del.status).toBe(204);
  });
});
