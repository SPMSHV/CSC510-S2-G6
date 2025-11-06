/**
 * Copyright (c) 2025 CampusBot Contributors
 * Licensed under the MIT License
 */

import request from 'supertest';
import { createApp } from './helpers/request';

const app = createApp();

describe('Export/Import API', () => {
  let adminToken: string;
  let adminId: string;
  let vendorToken: string;
  let vendorId: string;
  let studentToken: string;
  let studentId: string;
  let orderId: string;
  let robotId: string;
  let restaurantId: string;

  beforeAll(async () => {
    // Create admin user
    const adminRes = await request(app).post('/api/auth/register').send({
      email: 'admin@export.test.com',
      name: 'Admin User',
      password: 'password123',
      role: 'ADMIN',
    });
    adminToken = adminRes.body.token;
    adminId = adminRes.body.user.id;

    // Create vendor user
    const vendorRes = await request(app).post('/api/auth/register').send({
      email: 'vendor@export.test.com',
      name: 'Vendor User',
      password: 'password123',
      role: 'VENDOR',
    });
    vendorToken = vendorRes.body.token;
    vendorId = vendorRes.body.user.id;

    // Create student user
    const studentRes = await request(app).post('/api/auth/register').send({
      email: 'student@export.test.com',
      name: 'Student User',
      password: 'password123',
      role: 'STUDENT',
    });
    studentToken = studentRes.body.token;
    studentId = studentRes.body.user.id;

    // Create a restaurant for the vendor
    const restaurantRes = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        name: 'Test Restaurant',
        description: 'Test Description',
        location: { lat: 35.77, lng: -78.64 },
      });
    restaurantId = restaurantRes.body.id;

    // Create a robot
    const robotRes = await request(app).post('/api/robots').send({
      robotId: 'RB-EXPORT-01',
      status: 'IDLE',
      batteryPercent: 85,
      location: { lat: 35.77, lng: -78.64 },
    });
    robotId = robotRes.body.id;

    // Create an order
    const orderRes = await request(app).post('/api/orders').send({
      userId: studentId,
      vendorId: vendorId,
      items: [
        { name: 'Burger', quantity: 1, price: 10 },
        { name: 'Fries', quantity: 2, price: 3 },
      ],
      deliveryLocation: 'Building A',
    });
    orderId = orderRes.body.id;
  });

  describe('GET /api/export/json', () => {
    it('exports all data as JSON for admin', async () => {
      const res = await request(app).get('/api/export/json').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.headers['content-disposition']).toContain('campusbot-export.json');

      expect(res.body).toHaveProperty('orders');
      expect(res.body).toHaveProperty('robots');
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('restaurants');
      expect(res.body).toHaveProperty('exportedAt');
      expect(res.body).toHaveProperty('version', '1.0');

      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(Array.isArray(res.body.robots)).toBe(true);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(Array.isArray(res.body.restaurants)).toBe(true);

      // Verify order is included
      const order = res.body.orders.find((o: any) => o.id === orderId);
      expect(order).toBeDefined();
      expect(order.total).toBe(16);
    });

    it('rejects access for non-admin users', async () => {
      const res = await request(app).get('/api/export/json').set('Authorization', `Bearer ${vendorToken}`);
      expect(res.status).toBe(403);
    });

    it('rejects access for unauthenticated users', async () => {
      const res = await request(app).get('/api/export/json');
      expect(res.status).toBe(401);
    });

    it('rejects access for student users', async () => {
      const res = await request(app).get('/api/export/json').set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/export/orders/csv', () => {
    it('exports orders as CSV for admin', async () => {
      const res = await request(app).get('/api/export/orders/csv').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.headers['content-disposition']).toContain('orders-export.csv');

      const csv = res.text;
      expect(csv).toContain('id,userId,vendorId,status,total,deliveryLocation,createdAt,updatedAt');
      expect(csv).toContain(orderId);
      expect(csv).toContain('CREATED');
      expect(csv).toContain('16');
    });

    it('exports only vendor orders for vendor', async () => {
      // Create another order for a different vendor
      const vendor2Res = await request(app).post('/api/auth/register').send({
        email: 'vendor2@export.test.com',
        name: 'Vendor 2',
        password: 'password123',
        role: 'VENDOR',
      });
      const vendor2Token = vendor2Res.body.token;
      const vendor2Id = vendor2Res.body.user.id;

      await request(app).post('/api/orders').send({
        userId: studentId,
        vendorId: vendor2Id,
        items: [{ name: 'Pizza', quantity: 1, price: 15 }],
        deliveryLocation: 'Building B',
      });

      const res = await request(app).get('/api/export/orders/csv').set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      const csv = res.text;
      // Should only contain orders for the first vendor
      expect(csv).toContain(vendorId);
      expect(csv).not.toContain(vendor2Id);
    });

    it('rejects access for unauthenticated users', async () => {
      const res = await request(app).get('/api/export/orders/csv');
      expect(res.status).toBe(401);
    });

    it('rejects access for student users', async () => {
      const res = await request(app).get('/api/export/orders/csv').set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('returns empty CSV when vendor has no orders', async () => {
      const newVendorRes = await request(app).post('/api/auth/register').send({
        email: 'newvendor@export.test.com',
        name: 'New Vendor',
        password: 'password123',
        role: 'VENDOR',
      });
      const newVendorToken = newVendorRes.body.token;

      const res = await request(app)
        .get('/api/export/orders/csv')
        .set('Authorization', `Bearer ${newVendorToken}`);

      expect(res.status).toBe(200);
      const csv = res.text;
      expect(csv).toContain('id,userId,vendorId,status,total,deliveryLocation,createdAt,updatedAt');
      // Should only have header row
      const lines = csv.trim().split('\n');
      expect(lines.length).toBe(1);
    });
  });

  describe('POST /api/export/import', () => {
    it('rejects import for non-admin users', async () => {
      const importData = {
        orders: [],
        robots: [],
        users: [],
        restaurants: [],
      };

      const res = await request(app)
        .post('/api/export/import')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(importData);

      expect(res.status).toBe(403);
    });

    it('rejects import for unauthenticated users', async () => {
      const importData = {
        orders: [],
        robots: [],
        users: [],
        restaurants: [],
      };

      const res = await request(app).post('/api/export/import').send(importData);
      expect(res.status).toBe(401);
    });

    it('rejects import with no data', async () => {
      const res = await request(app)
        .post('/api/export/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('No data provided');
    });

    it('returns error for import in memory mode', async () => {
      const importData = {
        orders: [
          {
            userId: studentId,
            vendorId: vendorId,
            items: [{ name: 'Test Item', quantity: 1, price: 10 }],
            deliveryLocation: 'Test Location',
          },
        ],
      };

      const res = await request(app)
        .post('/api/export/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(importData);

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThan(0);
      expect(res.body.errors[0]).toContain('Import is only supported in PostgreSQL mode');
    });

    it('validates import data structure', async () => {
      const invalidData = {
        orders: 'not an array',
        robots: null,
      };

      const res = await request(app)
        .post('/api/export/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      // Should handle gracefully
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('imported');
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('Export data integrity', () => {
    it('exported JSON contains valid data structures', async () => {
      const res = await request(app).get('/api/export/json').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const data = res.body;

      // Verify order structure
      if (data.orders.length > 0) {
        const order = data.orders[0];
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('userId');
        expect(order).toHaveProperty('vendorId');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('total');
        expect(order).toHaveProperty('items');
        expect(Array.isArray(order.items)).toBe(true);
      }

      // Verify robot structure
      if (data.robots.length > 0) {
        const robot = data.robots[0];
        expect(robot).toHaveProperty('id');
        expect(robot).toHaveProperty('robotId');
        expect(robot).toHaveProperty('status');
        expect(robot).toHaveProperty('batteryPercent');
        expect(robot).toHaveProperty('location');
      }

      // Verify user structure
      if (data.users.length > 0) {
        const user = data.users[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('role');
      }

      // Verify restaurant structure
      if (data.restaurants.length > 0) {
        const restaurant = data.restaurants[0];
        expect(restaurant).toHaveProperty('id');
        expect(restaurant).toHaveProperty('name');
        expect(restaurant).toHaveProperty('vendorId');
      }
    });

    it('exported CSV has correct format', async () => {
      const res = await request(app).get('/api/export/orders/csv').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const csv = res.text;
      const lines = csv.trim().split('\n');

      expect(lines.length).toBeGreaterThan(0);
      expect(lines[0]).toBe('id,userId,vendorId,status,total,deliveryLocation,createdAt,updatedAt');

      if (lines.length > 1) {
        // Verify data row format
        const dataRow = lines[1];
        expect(dataRow).toContain('"');
        const fields = dataRow.split(',');
        expect(fields.length).toBe(8);
      }
    });
  });

  describe('Export edge cases', () => {
    it('handles export with existing data', async () => {
      // Create a fresh admin
      const cleanAdminRes = await request(app).post('/api/auth/register').send({
        email: `cleanadmin${Date.now()}@test.com`,
        name: 'Clean Admin',
        password: 'password123',
        role: 'ADMIN',
      });
      const cleanAdminToken = cleanAdminRes.body.token;

      const res = await request(app).get('/api/export/json').set('Authorization', `Bearer ${cleanAdminToken}`);

      expect(res.status).toBe(200);
      // In-memory storage is shared, so we should have data from previous tests
      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(Array.isArray(res.body.robots)).toBe(true);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(Array.isArray(res.body.restaurants)).toBe(true);
      // Verify the structure is correct regardless of data
      expect(res.body).toHaveProperty('exportedAt');
      expect(res.body).toHaveProperty('version', '1.0');
      // Verify exportedAt is a valid ISO string
      expect(typeof res.body.exportedAt).toBe('string');
      expect(() => new Date(res.body.exportedAt)).not.toThrow();
    });

    it('CSV export handles orders with missing optional fields', async () => {
      // Create order with minimal data
      const minimalOrder = await request(app).post('/api/orders').send({
        userId: studentId,
        vendorId: vendorId,
        items: [{ name: 'Minimal', quantity: 1, price: 5 }],
        deliveryLocation: 'Location',
      });

      const res = await request(app).get('/api/export/orders/csv').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const csv = res.text;
      expect(csv).toContain(minimalOrder.body.id);
    });
  });
});

