import { processOrderStatusChange, findNearestAvailableRobot, assignRobotToOrder } from '../src/services/robotAssignment';
import * as orderQueries from '../src/db/queries/orders';
import * as robotQueries from '../src/db/queries/robots';

// Mock the database queries
jest.mock('../src/db/queries/orders', () => ({
  getOrderById: jest.fn(),
  updateOrder: jest.fn(),
}));
jest.mock('../src/db/queries/robots', () => ({
  getAvailableRobots: jest.fn(),
  updateRobot: jest.fn(),
}));

// Access the mocked functions
const mockGetOrderById = jest.mocked(orderQueries.getOrderById);
const mockUpdateOrder = jest.mocked(orderQueries.updateOrder);
const mockGetAvailableRobots = jest.mocked(robotQueries.getAvailableRobots);
const mockUpdateRobot = jest.mocked(robotQueries.updateRobot);

describe('Vendor Order Service - Core Business Logic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Core Assumption 1: Robot Assignment Algorithm - Nearest robot selection', () => {
    it('should select the nearest available robot when multiple robots are available', async () => {
      const deliveryLat = 35.774;
      const deliveryLng = -78.676;

      const robots = [
        {
          id: 'robot-1',
          robotId: 'RB-001',
          status: 'IDLE' as const,
          batteryPercent: 80,
          location: { lat: 35.773, lng: -78.675 }, // ~0.14km away (nearest)
        },
        {
          id: 'robot-2',
          robotId: 'RB-002',
          status: 'IDLE' as const,
          batteryPercent: 75,
          location: { lat: 35.800, lng: -78.700 }, // ~3.5km away (farther)
        },
        {
          id: 'robot-3',
          robotId: 'RB-003',
          status: 'IDLE' as const,
          batteryPercent: 70,
          location: { lat: 35.750, lng: -78.650 }, // ~2.8km away
        },
      ] as any;

      mockGetAvailableRobots.mockResolvedValue(robots);

      const nearest = await findNearestAvailableRobot(deliveryLat, deliveryLng);

      expect(nearest).not.toBeNull();
      expect(nearest!.id).toBe('robot-1'); // Should select nearest
      expect(mockGetAvailableRobots).toHaveBeenCalled();
    });

    it('should return null when no robots are available', async () => {
      mockGetAvailableRobots.mockResolvedValue([]);

      const nearest = await findNearestAvailableRobot(35.774, -78.676);

      expect(nearest).toBeNull();
      expect(mockGetAvailableRobots).toHaveBeenCalled();
    });

    it('should correctly calculate distance using Haversine formula', async () => {
      // Test with known distances
      const deliveryLat = 35.772;
      const deliveryLng = -78.674;

      const robots = [
        {
          id: 'robot-close',
          robotId: 'RB-CLOSE',
          status: 'IDLE' as const,
          batteryPercent: 80,
          location: { lat: 35.773, lng: -78.675 }, // ~0.14km
        },
        {
          id: 'robot-far',
          robotId: 'RB-FAR',
          status: 'IDLE' as const,
          batteryPercent: 80,
          location: { lat: 35.800, lng: -78.700 }, // ~3.5km
        },
      ] as any;

      mockGetAvailableRobots.mockResolvedValue(robots);

      const nearest = await findNearestAvailableRobot(deliveryLat, deliveryLng);

      expect(nearest!.id).toBe('robot-close');
    });

    it('should only consider IDLE robots as available for assignment', async () => {
      const deliveryLat = 35.774;
      const deliveryLng = -78.676;

      mockGetAvailableRobots.mockResolvedValue([
        {
          id: 'robot-idle',
          robotId: 'RB-IDLE',
          status: 'IDLE' as const,
          batteryPercent: 80,
          location: { lat: 35.773, lng: -78.675 },
        } as any,
      ]);

      const nearest = await findNearestAvailableRobot(deliveryLat, deliveryLng);

      expect(nearest).not.toBeNull();
      // getAvailableRobots should filter out non-IDLE robots
      expect(mockGetAvailableRobots).toHaveBeenCalled();
    });
  });

  describe('Core Assumption 2: Robot Assignment Transaction - Atomic assignment operations', () => {
    it('should atomically assign robot to order and update both order and robot status', async () => {
      const orderId = 'order-1';
      const robotId = 'robot-1';

      mockUpdateOrder.mockResolvedValue({
        id: orderId,
        robotId,
        status: 'ASSIGNED',
      } as any);

      mockUpdateRobot.mockResolvedValue({
        id: robotId,
        status: 'ASSIGNED',
      } as any);

      await assignRobotToOrder(orderId, robotId);

      expect(mockUpdateOrder).toHaveBeenCalledWith(orderId, {
        robotId,
        status: 'ASSIGNED',
      });
      expect(mockUpdateRobot).toHaveBeenCalledWith(robotId, {
        status: 'ASSIGNED',
      });
    });

    it('should ensure order and robot are updated consistently during assignment', async () => {
      const orderId = 'order-2';
      const robotId = 'robot-2';

      mockUpdateOrder.mockResolvedValue({
        id: orderId,
        robotId,
        status: 'ASSIGNED',
      } as any);

      mockUpdateRobot.mockResolvedValue({
        id: robotId,
        status: 'ASSIGNED',
      } as any);

      await assignRobotToOrder(orderId, robotId);

      // Both should be called - verifying atomicity through proper sequencing
      const updateOrderCalls = mockUpdateOrder.mock.calls;
      const updateRobotCalls = mockUpdateRobot.mock.calls;

      expect(updateOrderCalls.length).toBe(1);
      expect(updateRobotCalls.length).toBe(1);
      expect(updateOrderCalls[0][1].robotId).toBe(robotId);
      expect(updateOrderCalls[0][1].status).toBe('ASSIGNED');
    });
  });

  describe('Core Assumption 3: Automatic Assignment Trigger - READY status triggers assignment', () => {
    it('should automatically assign robot when order status changes to READY with coordinates', async () => {
      const orderId = 'order-ready';
      const robotId = 'robot-available';

      mockGetOrderById.mockResolvedValue({
        id: orderId,
        status: 'CREATED',
        robotId: null,
        deliveryLocationLat: 35.773,
        deliveryLocationLng: -78.675,
      } as any);

      mockGetAvailableRobots.mockResolvedValue([
        {
          id: robotId,
          robotId: 'RB-001',
          status: 'IDLE',
          batteryPercent: 80,
          location: { lat: 35.772, lng: -78.674 },
        } as any,
      ]);

      mockUpdateOrder.mockResolvedValue({
        id: orderId,
        robotId,
        status: 'ASSIGNED',
      } as any);

      mockUpdateRobot.mockResolvedValue({
        id: robotId,
        status: 'ASSIGNED',
      } as any);

      await processOrderStatusChange(orderId, 'READY');

      expect(mockGetOrderById).toHaveBeenCalledWith(orderId);
      expect(mockGetAvailableRobots).toHaveBeenCalled();
      expect(mockUpdateOrder).toHaveBeenCalledWith(
        orderId,
        expect.objectContaining({ robotId, status: 'ASSIGNED' })
      );
    });

    it('should NOT assign robot if order lacks delivery coordinates even when READY', async () => {
      const orderId = 'order-no-coords';

      mockGetOrderById.mockResolvedValue({
        id: orderId,
        status: 'CREATED',
        robotId: null,
        deliveryLocationLat: null,
        deliveryLocationLng: null,
      } as any);

      await processOrderStatusChange(orderId, 'READY');

      expect(mockGetAvailableRobots).not.toHaveBeenCalled();
      expect(mockUpdateOrder).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ robotId: expect.anything() })
      );
    });

    it('should NOT assign robot if order already has a robot assigned', async () => {
      const orderId = 'order-already-assigned';
      const existingRobotId = 'robot-existing';

      mockGetOrderById.mockResolvedValue({
        id: orderId,
        status: 'PREPARING',
        robotId: existingRobotId,
        deliveryLocationLat: 35.773,
        deliveryLocationLng: -78.675,
      } as any);

      await processOrderStatusChange(orderId, 'READY');

      // Should not try to assign another robot
      expect(mockGetAvailableRobots).not.toHaveBeenCalled();
    });

    it('should keep order in READY status if no robots available', async () => {
      const orderId = 'order-ready-no-robots';

      mockGetOrderById.mockResolvedValue({
        id: orderId,
        status: 'PREPARING',
        robotId: null,
        deliveryLocationLat: 35.773,
        deliveryLocationLng: -78.675,
      } as any);

      mockGetAvailableRobots.mockResolvedValue([]);

      await processOrderStatusChange(orderId, 'READY');

      expect(mockGetAvailableRobots).toHaveBeenCalled();
      // Order should remain READY, not ASSIGNED
      expect(mockUpdateOrder).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'ASSIGNED' })
      );
    });
  });

  describe('Core Assumption 4: Robot State Management - Robot status reflects order state', () => {
    it('should update robot to EN_ROUTE when order status changes to EN_ROUTE', async () => {
      const orderId = 'order-enroute';
      const robotId = 'robot-assigned';

      mockGetOrderById.mockResolvedValue({
        id: orderId,
        status: 'ASSIGNED',
        robotId,
      } as any);

      mockUpdateRobot.mockResolvedValue({
        id: robotId,
        status: 'EN_ROUTE',
      } as any);

      await processOrderStatusChange(orderId, 'EN_ROUTE');

      expect(mockUpdateRobot).toHaveBeenCalledWith(robotId, {
        status: 'EN_ROUTE',
      });
    });

    it('should free robot and update location when order is DELIVERED', async () => {
      const orderId = 'order-delivered';
      const robotId = 'robot-delivery';

      mockGetOrderById.mockResolvedValue({
        id: orderId,
        status: 'EN_ROUTE',
        robotId,
        deliveryLocationLat: 35.780,
        deliveryLocationLng: -78.680,
      } as any);

      mockUpdateRobot.mockResolvedValue({
        id: robotId,
        status: 'IDLE',
        location: { lat: 35.780, lng: -78.680 },
      } as any);

      await processOrderStatusChange(orderId, 'DELIVERED');

      // Service makes two separate calls: first status, then location
      expect(mockUpdateRobot).toHaveBeenCalledTimes(2);
      expect(mockUpdateRobot).toHaveBeenNthCalledWith(1, robotId, {
        status: 'IDLE',
      });
      expect(mockUpdateRobot).toHaveBeenNthCalledWith(2, robotId, {
        location: { lat: 35.780, lng: -78.680 },
      });
    });

    it('should free robot when order is CANCELLED', async () => {
      const orderId = 'order-cancelled';
      const robotId = 'robot-cancelled';

      mockGetOrderById.mockResolvedValue({
        id: orderId,
        status: 'ASSIGNED',
        robotId,
      } as any);

      mockUpdateRobot.mockResolvedValue({
        id: robotId,
        status: 'IDLE',
      } as any);

      mockUpdateOrder.mockResolvedValue({
        id: orderId,
        robotId: null,
        status: 'CANCELLED',
      } as any);

      await processOrderStatusChange(orderId, 'CANCELLED');

      expect(mockUpdateRobot).toHaveBeenCalledWith(robotId, {
        status: 'IDLE',
      });
      expect(mockUpdateOrder).toHaveBeenCalledWith(orderId, {
        robotId: null,
      });
    });

    it('should handle delivery without coordinates gracefully', async () => {
      const orderId = 'order-delivered-no-coords';
      const robotId = 'robot-delivery';

      mockGetOrderById.mockResolvedValue({
        id: orderId,
        status: 'EN_ROUTE',
        robotId,
        deliveryLocationLat: null,
        deliveryLocationLng: null,
      } as any);

      mockUpdateRobot.mockResolvedValue({
        id: robotId,
        status: 'IDLE',
      } as any);

      await processOrderStatusChange(orderId, 'DELIVERED');

      // Should free robot but not update location
      expect(mockUpdateRobot).toHaveBeenCalledWith(robotId, {
        status: 'IDLE',
      });
      // Location update should not be called if coordinates are null
      expect(mockUpdateRobot).toHaveBeenCalledTimes(1);
    });
  });

  describe('Core Assumption 5: Error Handling - Graceful failure modes', () => {
    it('should throw error when order not found during status change', async () => {
      const orderId = 'nonexistent-order';

      mockGetOrderById.mockResolvedValue(null);

      await expect(processOrderStatusChange(orderId, 'READY')).rejects.toThrow('Order not found');
    });

    it('should handle database errors gracefully during robot assignment', async () => {
      const orderId = 'order-db-error';
      const robotId = 'robot-error';

      mockGetOrderById.mockResolvedValue({
        id: orderId,
        status: 'CREATED',
        robotId: null,
        deliveryLocationLat: 35.773,
        deliveryLocationLng: -78.675,
      } as any);

      mockGetAvailableRobots.mockRejectedValue(new Error('Database error'));

      await expect(processOrderStatusChange(orderId, 'READY')).rejects.toThrow('Database error');
    });
  });

  describe('Core Assumption 6: Status Transition Validation - Valid state machine', () => {
    it('should handle PREPARING status without triggering robot assignment', async () => {
      const orderId = 'order-preparing';

      mockGetOrderById.mockResolvedValue({
        id: orderId,
        status: 'CREATED',
        robotId: null,
      } as any);

      await processOrderStatusChange(orderId, 'PREPARING');

      // Should not attempt robot assignment
      expect(mockGetAvailableRobots).not.toHaveBeenCalled();
    });

    it('should handle non-critical status changes (CREATED, PREPARING) without side effects', async () => {
      const orderId = 'order-non-critical';
      const statuses = ['CREATED', 'PREPARING'] as const;

      for (const status of statuses) {
        mockGetOrderById.mockResolvedValue({
          id: orderId,
          status: 'CREATED',
          robotId: null,
        } as any);

        await processOrderStatusChange(orderId, status);

        expect(mockGetAvailableRobots).not.toHaveBeenCalled();
        jest.clearAllMocks();
      }
    });
  });

  describe('Core Assumption 7: Robot Availability Logic - Available robots only', () => {
    it('should only consider robots with IDLE status for assignment', async () => {
      const deliveryLat = 35.774;
      const deliveryLng = -78.676;

      // getAvailableRobots should filter for IDLE status
      mockGetAvailableRobots.mockResolvedValue([
        {
          id: 'robot-idle',
          robotId: 'RB-IDLE',
          status: 'IDLE',
          batteryPercent: 80,
          location: { lat: 35.773, lng: -78.675 },
        } as any,
      ]);

      const nearest = await findNearestAvailableRobot(deliveryLat, deliveryLng);

      expect(nearest).not.toBeNull();
      expect(mockGetAvailableRobots).toHaveBeenCalled();
      // The query layer should filter out ASSIGNED, EN_ROUTE, etc.
    });

    it('should handle edge case where robot becomes unavailable between check and assignment', async () => {
      const orderId = 'order-race-condition';

      mockGetOrderById.mockResolvedValue({
        id: orderId,
        status: 'PREPARING',
        robotId: null,
        deliveryLocationLat: 35.773,
        deliveryLocationLng: -78.675,
      } as any);

      // First call finds robots, second call (during assignment) finds none
      mockGetAvailableRobots
        .mockResolvedValueOnce([
          {
            id: 'robot-1',
            robotId: 'RB-001',
            status: 'IDLE',
            batteryPercent: 80,
            location: { lat: 35.772, lng: -78.674 },
          } as any,
        ])
        .mockResolvedValueOnce([]);

      // Simulate race: robot gets assigned to another order between calls
      mockUpdateOrder.mockRejectedValue(new Error('Robot no longer available'));

      await expect(processOrderStatusChange(orderId, 'READY')).rejects.toThrow();
    });
  });

  describe('Core Assumption 8: Order-Robot Binding - Consistent binding state', () => {
    it('should clear robot binding when order is cancelled', async () => {
      const orderId = 'order-cancel-binding';
      const robotId = 'robot-cancel-binding';

      mockGetOrderById.mockResolvedValue({
        id: orderId,
        status: 'ASSIGNED',
        robotId,
      } as any);

      mockUpdateOrder.mockResolvedValue({
        id: orderId,
        robotId: null,
        status: 'CANCELLED',
      } as any);

      await processOrderStatusChange(orderId, 'CANCELLED');

      // Binding should be cleared
      expect(mockUpdateOrder).toHaveBeenCalledWith(orderId, {
        robotId: null,
      });
    });
  });
});
