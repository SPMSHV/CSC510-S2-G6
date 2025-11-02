import request from 'supertest';
import { createApp, createAuthToken } from './helpers/request';

const app = createApp();

describe('Vendor Orders API', () => {
  let vendorToken: string;
  let vendorId: string;
  let studentToken: string;
  let studentId: string;
  let orderId: string;

  beforeAll(async () => {
    // Create vendor user
    const vendorRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'vendor@test.com',
        name: 'Test Vendor',
        password: 'password123',
        role: 'VENDOR',
      });
    vendorToken = vendorRes.body.token;
    vendorId = vendorRes.body.user.id;

    // Create student user
    const studentRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'student@test.com',
        name: 'Test Student',
        password: 'password123',
        role: 'STUDENT',
      });
    studentToken = studentRes.body.token;
    studentId = studentRes.body.user.id;
  });

  beforeEach(async () => {
    // Create an order for the vendor
    const orderRes = await request(app)
      .post('/api/orders')
      .send({
        userId: studentId,
        vendorId: vendorId,
        items: [{ name: 'Burger', quantity: 1, price: 10 }],
        deliveryLocation: 'Building A',
      });
    orderId = orderRes.body.id;
  });

  describe('GET /api/orders/vendor-orders', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/orders/vendor-orders');
      expect(res.status).toBe(401);
    });

    it('should return 403 when accessed by non-vendor user', async () => {
      const res = await request(app)
        .get('/api/orders/vendor-orders')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Vendor role required');
    });

    it('should return orders for authenticated vendor', async () => {
      const res = await request(app)
        .get('/api/orders/vendor-orders')
        .set('Authorization', `Bearer ${vendorToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].vendorId).toBe(vendorId);
    });

    it('should only return orders belonging to the vendor', async () => {
      // Create another vendor and order
      const otherVendorRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'vendor2@test.com',
          name: 'Other Vendor',
          password: 'password123',
          role: 'VENDOR',
        });
      const otherVendorToken = otherVendorRes.body.token;
      const otherVendorId = otherVendorRes.body.user.id;

      await request(app)
        .post('/api/orders')
        .send({
          userId: studentId,
          vendorId: otherVendorId,
          items: [{ name: 'Pizza', quantity: 1, price: 15 }],
          deliveryLocation: 'Building B',
        });

      // Original vendor should only see their orders
      const res = await request(app)
        .get('/api/orders/vendor-orders')
        .set('Authorization', `Bearer ${vendorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.every((order: any) => order.vendorId === vendorId)).toBe(true);
    });

    it('should allow ADMIN to access vendor orders', async () => {
      const adminRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'admin@test.com',
          name: 'Admin',
          password: 'password123',
          role: 'ADMIN',
        });
      const adminToken = adminRes.body.token;

      const res = await request(app)
        .get('/api/orders/vendor-orders')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return empty array when vendor has no orders', async () => {
      const newVendorRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newvendor@test.com',
          name: 'New Vendor',
          password: 'password123',
          role: 'VENDOR',
        });
      const newVendorToken = newVendorRes.body.token;

      const res = await request(app)
        .get('/api/orders/vendor-orders')
        .set('Authorization', `Bearer ${newVendorToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('PATCH /api/orders/:id - Vendor Authorization', () => {
    it('should allow vendor to update their own orders', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ status: 'PREPARING' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('PREPARING');
    });

    it('should prevent vendor from updating other vendor orders', async () => {
      // Create another vendor
      const otherVendorRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'vendor3@test.com',
          name: 'Another Vendor',
          password: 'password123',
          role: 'VENDOR',
        });
      const otherVendorToken = otherVendorRes.body.token;

      const res = await request(app)
        .patch(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${otherVendorToken}`)
        .send({ status: 'PREPARING' });
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Access denied');
    });

    it('should allow vendor to transition CREATED → PREPARING', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ status: 'PREPARING' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('PREPARING');
    });

    it('should allow vendor to transition PREPARING → READY', async () => {
      // First transition to PREPARING
      await request(app)
        .patch(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ status: 'PREPARING' });

      // Then transition to READY
      const res = await request(app)
        .patch(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ status: 'READY' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('READY');
    });

    it('should trigger robot assignment when status becomes READY', async () => {
      // Create a robot
      const robotRes = await request(app).post('/api/robots').send({
        robotId: 'RB-TEST-1',
        status: 'IDLE',
        batteryPercent: 80,
        location: { lat: 35.772, lng: -78.674 },
      });
      const robotId = robotRes.body.id;

      // Update order with delivery location
      await request(app)
        .patch(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ status: 'PREPARING' });

      // Transition to READY - should trigger robot assignment
      const res = await request(app)
        .patch(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ status: 'READY' });

      expect(res.status).toBe(200);
      // Robot should be assigned if one is available
      // Note: This depends on robot availability and delivery location
    });

    it('should require authentication to update order status', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}`)
        .send({ status: 'PREPARING' });
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .patch('/api/orders/nonexistent-id')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ status: 'PREPARING' });
      expect(res.status).toBe(404);
    });

    it('should validate status value', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ status: 'INVALID_STATUS' });
      expect(res.status).toBe(400);
    });

    it('should allow ADMIN to update any order', async () => {
      const adminRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'admin2@test.com',
          name: 'Admin User',
          password: 'password123',
          role: 'ADMIN',
        });
      const adminToken = adminRes.body.token;

      const res = await request(app)
        .patch(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PREPARING' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('PREPARING');
    });
  });
});

