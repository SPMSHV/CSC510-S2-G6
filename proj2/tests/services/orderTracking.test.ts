import { getOrderProgress, getOrderTrackingInfo } from '../../src/services/orderTracking';
import * as orderQueries from '../../src/db/queries/orders';
import * as robotQueries from '../../src/db/queries/robots';

// Mock the database query modules
jest.mock('../../src/db/queries/orders');
jest.mock('../../src/db/queries/robots');

const mockOrderQueries = orderQueries as jest.Mocked<typeof orderQueries>;
const mockRobotQueries = robotQueries as jest.Mocked<typeof robotQueries>;

describe('Order Tracking Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderProgress', () => {
    it('returns correct progress for CREATED status', () => {
      const result = getOrderProgress('CREATED');
      expect(result.progress).toBe(0);
      expect(result.statusLabel).toBe('Order Created');
      expect(result.estimatedTimeToNext).toBe(2);
    });

    it('returns correct progress for PREPARING status', () => {
      const result = getOrderProgress('PREPARING');
      expect(result.progress).toBe(25);
      expect(result.statusLabel).toBe('Preparing Your Order');
      expect(result.estimatedTimeToNext).toBe(10);
    });

    it('returns correct progress for READY status', () => {
      const result = getOrderProgress('READY');
      expect(result.progress).toBe(50);
      expect(result.statusLabel).toBe('Ready for Pickup');
      expect(result.estimatedTimeToNext).toBe(5);
    });

    it('returns correct progress for ASSIGNED status', () => {
      const result = getOrderProgress('ASSIGNED');
      expect(result.progress).toBe(60);
      expect(result.statusLabel).toBe('Robot Assigned');
      expect(result.estimatedTimeToNext).toBe(3);
    });

    it('returns correct progress for EN_ROUTE status', () => {
      const result = getOrderProgress('EN_ROUTE');
      expect(result.progress).toBe(80);
      expect(result.statusLabel).toBe('On The Way');
      expect(result.estimatedTimeToNext).toBe(15);
    });

    it('returns correct progress for DELIVERED status', () => {
      const result = getOrderProgress('DELIVERED');
      expect(result.progress).toBe(100);
      expect(result.statusLabel).toBe('Delivered');
      expect(result.estimatedTimeToNext).toBeUndefined();
    });

    it('returns correct progress for CANCELLED status', () => {
      const result = getOrderProgress('CANCELLED');
      expect(result.progress).toBe(0);
      expect(result.statusLabel).toBe('Cancelled');
      expect(result.estimatedTimeToNext).toBeUndefined();
    });
  });

  describe('getOrderTrackingInfo', () => {
    it('returns null when order not found', async () => {
      mockOrderQueries.getOrderById.mockResolvedValue(null);

      const result = await getOrderTrackingInfo('nonexistent');
      expect(result).toBeNull();
    });

    it('returns tracking info for order without robot', async () => {
      const order: orderQueries.Order = {
        id: 'order-1',
        userId: 'user-1',
        vendorId: 'vendor-1',
        robotId: null,
        items: [{ name: 'Burger', quantity: 1, price: 10 }],
        total: 10,
        deliveryLocation: 'Building A',
        deliveryLocationLat: null,
        deliveryLocationLng: null,
        status: 'CREATED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockOrderQueries.getOrderById.mockResolvedValue(order);

      const result = await getOrderTrackingInfo('order-1');
      expect(result).toBeDefined();
      expect(result?.order.id).toBe('order-1');
      expect(result?.robot).toBeNull();
      expect(result?.progress.status).toBe('CREATED');
      expect(result?.estimatedDeliveryTime).toBe(2); // From progress.estimatedTimeToNext
    });

    it('returns tracking info for order with robot', async () => {
      const order: orderQueries.Order = {
        id: 'order-1',
        userId: 'user-1',
        vendorId: 'vendor-1',
        robotId: 'robot-1',
        items: [],
        total: 10,
        deliveryLocation: 'Building A',
        deliveryLocationLat: null,
        deliveryLocationLng: null,
        status: 'ASSIGNED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const robot: robotQueries.Robot = {
        id: 'robot-1',
        robotId: 'RB-01',
        status: 'ASSIGNED',
        batteryPercent: 90,
        location: { lat: 35.0, lng: -78.0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockOrderQueries.getOrderById.mockResolvedValue(order);
      mockRobotQueries.getRobotById.mockResolvedValue(robot);

      const result = await getOrderTrackingInfo('order-1');
      expect(result).toBeDefined();
      expect(result?.robot).toBeDefined();
      expect(result?.robot?.id).toBe('robot-1');
      expect(result?.progress.status).toBe('ASSIGNED');
    });

    it('calculates estimated delivery time for EN_ROUTE orders with robot', async () => {
      const order: orderQueries.Order = {
        id: 'order-1',
        userId: 'user-1',
        vendorId: 'vendor-1',
        robotId: 'robot-1',
        items: [],
        total: 10,
        deliveryLocation: 'Building A',
        deliveryLocationLat: 35.1,
        deliveryLocationLng: -78.1,
        status: 'EN_ROUTE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const robot: robotQueries.Robot = {
        id: 'robot-1',
        robotId: 'RB-01',
        status: 'EN_ROUTE',
        batteryPercent: 90,
        location: { lat: 35.0, lng: -78.0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockOrderQueries.getOrderById.mockResolvedValue(order);
      mockRobotQueries.getRobotById.mockResolvedValue(robot);

      const result = await getOrderTrackingInfo('order-1');
      expect(result).toBeDefined();
      expect(result?.estimatedDeliveryTime).toBeDefined();
      expect(typeof result?.estimatedDeliveryTime).toBe('number');
      expect(result?.estimatedDeliveryTime).toBeGreaterThanOrEqual(5);
    });

    it('uses progress estimated time when order is not EN_ROUTE', async () => {
      const order: orderQueries.Order = {
        id: 'order-1',
        userId: 'user-1',
        vendorId: 'vendor-1',
        robotId: null,
        items: [],
        total: 10,
        deliveryLocation: 'Building A',
        deliveryLocationLat: null,
        deliveryLocationLng: null,
        status: 'PREPARING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockOrderQueries.getOrderById.mockResolvedValue(order);

      const result = await getOrderTrackingInfo('order-1');
      expect(result?.estimatedDeliveryTime).toBe(10); // From PREPARING status
    });

    it('handles missing robot gracefully when robotId exists but robot not found', async () => {
      const order: orderQueries.Order = {
        id: 'order-1',
        userId: 'user-1',
        vendorId: 'vendor-1',
        robotId: 'robot-1',
        items: [],
        total: 10,
        deliveryLocation: 'Building A',
        deliveryLocationLat: null,
        deliveryLocationLng: null,
        status: 'ASSIGNED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockOrderQueries.getOrderById.mockResolvedValue(order);
      mockRobotQueries.getRobotById.mockResolvedValue(null);

      const result = await getOrderTrackingInfo('order-1');
      expect(result).toBeDefined();
      expect(result?.robot).toBeNull();
    });

    it('does not calculate delivery time for EN_ROUTE without coordinates', async () => {
      const order: orderQueries.Order = {
        id: 'order-1',
        userId: 'user-1',
        vendorId: 'vendor-1',
        robotId: 'robot-1',
        items: [],
        total: 10,
        deliveryLocation: 'Building A',
        deliveryLocationLat: null,
        deliveryLocationLng: null,
        status: 'EN_ROUTE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const robot: robotQueries.Robot = {
        id: 'robot-1',
        robotId: 'RB-01',
        status: 'EN_ROUTE',
        batteryPercent: 90,
        location: { lat: 35.0, lng: -78.0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockOrderQueries.getOrderById.mockResolvedValue(order);
      mockRobotQueries.getRobotById.mockResolvedValue(robot);

      const result = await getOrderTrackingInfo('order-1');
      expect(result).toBeDefined();
      // Should use progress estimatedTimeToNext since coordinates are missing
      expect(result?.estimatedDeliveryTime).toBe(15); // From EN_ROUTE status
    });

    it('does not calculate delivery time for EN_ROUTE without robot', async () => {
      const order: orderQueries.Order = {
        id: 'order-1',
        userId: 'user-1',
        vendorId: 'vendor-1',
        robotId: null,
        items: [],
        total: 10,
        deliveryLocation: 'Building A',
        deliveryLocationLat: 35.1,
        deliveryLocationLng: -78.1,
        status: 'EN_ROUTE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockOrderQueries.getOrderById.mockResolvedValue(order);

      const result = await getOrderTrackingInfo('order-1');
      expect(result).toBeDefined();
      // Should use progress estimatedTimeToNext since robot is missing
      expect(result?.estimatedDeliveryTime).toBe(15);
    });
  });
});

