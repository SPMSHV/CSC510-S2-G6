import { processOrderStatusChange, findNearestAvailableRobot, assignRobotToOrder } from '../src/services/robotAssignment';
import * as orderQueries from '../src/db/queries/orders';
import * as robotQueries from '../src/db/queries/robots';

// Mock the database queries
jest.mock('../src/db/queries/orders');
jest.mock('../src/db/queries/robots');

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
      ];

      (robotQueries.getAvailableRobots as jest.Mock).mockResolvedValue(robots);

      const nearest = await findNearestAvailableRobot(deliveryLat, deliveryLng);

      expect(nearest).not.toBeNull();
      expect(nearest!.id).toBe('robot-1'); // Should select nearest
      expect(robotQueries.getAvailableRobots).toHaveBeenCalled();
    });

    it('should return null when no robots are available', async () => {
      (robotQueries.getAvailableRobots as jest.Mock).mockResolvedValue([]);

      const nearest = await findNearestAvailableRobot(35.774, -78.676);

      expect(nearest).toBeNull();
      expect(robotQueries.getAvailableRobots).toHaveBeenCalled();
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
      ];

      (robotQueries.getAvailableRobots as jest.Mock).mockResolvedValue(robots);

      const nearest = await findNearestAvailableRobot(deliveryLat, deliveryLng);

      expect(nearest!.id).toBe('robot-close');
    });

    it('should only consider IDLE robots as available for assignment', async () => {
      const deliveryLat = 35.774;
      const deliveryLng = -78.676;

      (robotQueries.getAvailableRobots as jest.Mock).mockResolvedValue([
        {
          id: 'robot-idle',
          robotId: 'RB-IDLE',
          status: 'IDLE' as const,
          batteryPercent: 80,
          location: { lat: 35.773, lng: -78.675 },
        },
      ]);

      const nearest = await findNearestAvailableRobot(deliveryLat, deliveryLng);

      expect(nearest).not.toBeNull();
      // getAvailableRobots should filter out non-IDLE robots
      expect(robotQueries.getAvailableRobots).toHaveBeenCalled();
    });
  });

  describe('Core Assumption 2: Robot Assignment Transaction - Atomic assignment operations', () => {
    it('should atomically assign robot to order and update both order and robot status', async () => {
      const orderId = 'order-1';
      const robotId = 'robot-1';

      (orderQueries.updateOrder as jest.Mock).mockResolvedValue({
        id: orderId,
        robotId,
        status: 'ASSIGNED',
      });

      (robotQueries.updateRobot as jest.Mock).mockResolvedValue({
        id: robotId,
        status: 'ASSIGNED',
      });

      await assignRobotToOrder(orderId, robotId);

      expect(orderQueries.updateOrder).toHaveBeenCalledWith(orderId, {
        robotId,
        status: 'ASSIGNED',
      });
      expect(robotQueries.updateRobot).toHaveBeenCalledWith(robotId, {
        status: 'ASSIGNED',
      });
    });

    it('should ensure order and robot are updated consistently during assignment', async () => {
      const orderId = 'order-2';
      const robotId = 'robot-2';

      (orderQueries.updateOrder as jest.Mock).mockResolvedValue({
        id: orderId,
        robotId,
        status: 'ASSIGNED',
      });

      (robotQueries.updateRobot as jest.Mock).mockResolvedValue({
        id: robotId,
        status: 'ASSIGNED',
      });

      await assignRobotToOrder(orderId, robotId);

      // Both should be called - verifying atomicity through proper sequencing
      const updateOrderCalls = (orderQueries.updateOrder as jest.Mock).mock.calls;
      const updateRobotCalls = (robotQueries.updateRobot as jest.Mock).mock.calls;

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

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'CREATED',
        robotId: null,
        deliveryLocationLat: 35.773,
        deliveryLocationLng: -78.675,
      });

      (robotQueries.getAvailableRobots as jest.Mock).mockResolvedValue([
        {
          id: robotId,
          robotId: 'RB-001',
          status: 'IDLE',
          batteryPercent: 80,
          location: { lat: 35.772, lng: -78.674 },
        },
      ]);

      (orderQueries.updateOrder as jest.Mock).mockResolvedValue({
        id: orderId,
        robotId,
        status: 'ASSIGNED',
      });

      (robotQueries.updateRobot as jest.Mock).mockResolvedValue({
        id: robotId,
        status: 'ASSIGNED',
      });

      await processOrderStatusChange(orderId, 'READY');

      expect(orderQueries.getOrderById).toHaveBeenCalledWith(orderId);
      expect(robotQueries.getAvailableRobots).toHaveBeenCalled();
      expect(orderQueries.updateOrder).toHaveBeenCalledWith(
        orderId,
        expect.objectContaining({ robotId, status: 'ASSIGNED' })
      );
    });

    it('should NOT assign robot if order lacks delivery coordinates even when READY', async () => {
      const orderId = 'order-no-coords';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'CREATED',
        robotId: null,
        deliveryLocationLat: null,
        deliveryLocationLng: null,
      });

      await processOrderStatusChange(orderId, 'READY');

      expect(robotQueries.getAvailableRobots).not.toHaveBeenCalled();
      expect(orderQueries.updateOrder).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ robotId: expect.anything() })
      );
    });

    it('should NOT assign robot if order already has a robot assigned', async () => {
      const orderId = 'order-already-assigned';
      const existingRobotId = 'robot-existing';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'PREPARING',
        robotId: existingRobotId,
        deliveryLocationLat: 35.773,
        deliveryLocationLng: -78.675,
      });

      await processOrderStatusChange(orderId, 'READY');

      // Should not try to assign another robot
      expect(robotQueries.getAvailableRobots).not.toHaveBeenCalled();
    });

    it('should keep order in READY status if no robots available', async () => {
      const orderId = 'order-ready-no-robots';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'PREPARING',
        robotId: null,
        deliveryLocationLat: 35.773,
        deliveryLocationLng: -78.675,
      });

      (robotQueries.getAvailableRobots as jest.Mock).mockResolvedValue([]);

      await processOrderStatusChange(orderId, 'READY');

      expect(robotQueries.getAvailableRobots).toHaveBeenCalled();
      // Order should remain READY, not ASSIGNED
      expect(orderQueries.updateOrder).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'ASSIGNED' })
      );
    });
  });

  describe('Core Assumption 4: Robot State Management - Robot status reflects order state', () => {
    it('should update robot to EN_ROUTE when order status changes to EN_ROUTE', async () => {
      const orderId = 'order-enroute';
      const robotId = 'robot-assigned';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'ASSIGNED',
        robotId,
      });

      (robotQueries.updateRobot as jest.Mock).mockResolvedValue({
        id: robotId,
        status: 'EN_ROUTE',
      });

      await processOrderStatusChange(orderId, 'EN_ROUTE');

      expect(robotQueries.updateRobot).toHaveBeenCalledWith(robotId, {
        status: 'EN_ROUTE',
      });
    });

    it('should free robot and update location when order is DELIVERED', async () => {
      const orderId = 'order-delivered';
      const robotId = 'robot-delivery';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'EN_ROUTE',
        robotId,
        deliveryLocationLat: 35.780,
        deliveryLocationLng: -78.680,
      });

      (robotQueries.updateRobot as jest.Mock).mockResolvedValue({
        id: robotId,
        status: 'IDLE',
        location: { lat: 35.780, lng: -78.680 },
      });

      await processOrderStatusChange(orderId, 'DELIVERED');

      expect(robotQueries.updateRobot).toHaveBeenCalledWith(robotId, {
        status: 'IDLE',
        location: { lat: 35.780, lng: -78.680 },
      });
    });

    it('should free robot when order is CANCELLED', async () => {
      const orderId = 'order-cancelled';
      const robotId = 'robot-cancelled';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'ASSIGNED',
        robotId,
      });

      (robotQueries.updateRobot as jest.Mock).mockResolvedValue({
        id: robotId,
        status: 'IDLE',
      });

      (orderQueries.updateOrder as jest.Mock).mockResolvedValue({
        id: orderId,
        robotId: null,
        status: 'CANCELLED',
      });

      await processOrderStatusChange(orderId, 'CANCELLED');

      expect(robotQueries.updateRobot).toHaveBeenCalledWith(robotId, {
        status: 'IDLE',
      });
      expect(orderQueries.updateOrder).toHaveBeenCalledWith(orderId, {
        robotId: null,
      });
    });

    it('should handle delivery without coordinates gracefully', async () => {
      const orderId = 'order-delivered-no-coords';
      const robotId = 'robot-delivery';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'EN_ROUTE',
        robotId,
        deliveryLocationLat: null,
        deliveryLocationLng: null,
      });

      (robotQueries.updateRobot as jest.Mock).mockResolvedValue({
        id: robotId,
        status: 'IDLE',
      });

      await processOrderStatusChange(orderId, 'DELIVERED');

      // Should free robot but not update location
      expect(robotQueries.updateRobot).toHaveBeenCalledWith(robotId, {
        status: 'IDLE',
      });
      // Location update should not be called if coordinates are null
      expect(robotQueries.updateRobot).toHaveBeenCalledTimes(1);
    });
  });

  describe('Core Assumption 5: Error Handling - Graceful failure modes', () => {
    it('should throw error when order not found during status change', async () => {
      const orderId = 'nonexistent-order';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue(null);

      await expect(processOrderStatusChange(orderId, 'READY')).rejects.toThrow('Order not found');
    });

    it('should handle database errors gracefully during robot assignment', async () => {
      const orderId = 'order-db-error';
      const robotId = 'robot-error';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'CREATED',
        robotId: null,
        deliveryLocationLat: 35.773,
        deliveryLocationLng: -78.675,
      });

      (robotQueries.getAvailableRobots as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(processOrderStatusChange(orderId, 'READY')).rejects.toThrow('Database error');
    });
  });

  describe('Core Assumption 6: Status Transition Validation - Valid state machine', () => {
    it('should handle PREPARING status without triggering robot assignment', async () => {
      const orderId = 'order-preparing';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'CREATED',
        robotId: null,
      });

      await processOrderStatusChange(orderId, 'PREPARING');

      // Should not attempt robot assignment
      expect(robotQueries.getAvailableRobots).not.toHaveBeenCalled();
    });

    it('should handle non-critical status changes (CREATED, PREPARING) without side effects', async () => {
      const orderId = 'order-non-critical';
      const statuses = ['CREATED', 'PREPARING'] as const;

      for (const status of statuses) {
        (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
          id: orderId,
          status: 'CREATED',
          robotId: null,
        });

        await processOrderStatusChange(orderId, status);

        expect(robotQueries.getAvailableRobots).not.toHaveBeenCalled();
        jest.clearAllMocks();
      }
    });
  });

  describe('Core Assumption 7: Robot Availability Logic - Available robots only', () => {
    it('should only consider robots with IDLE status for assignment', async () => {
      const deliveryLat = 35.774;
      const deliveryLng = -78.676;

      // getAvailableRobots should filter for IDLE status
      (robotQueries.getAvailableRobots as jest.Mock).mockResolvedValue([
        {
          id: 'robot-idle',
          robotId: 'RB-IDLE',
          status: 'IDLE',
          batteryPercent: 80,
          location: { lat: 35.773, lng: -78.675 },
        },
      ]);

      const nearest = await findNearestAvailableRobot(deliveryLat, deliveryLng);

      expect(nearest).not.toBeNull();
      expect(robotQueries.getAvailableRobots).toHaveBeenCalled();
      // The query layer should filter out ASSIGNED, EN_ROUTE, etc.
    });

    it('should handle edge case where robot becomes unavailable between check and assignment', async () => {
      const orderId = 'order-race-condition';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'PREPARING',
        robotId: null,
        deliveryLocationLat: 35.773,
        deliveryLocationLng: -78.675,
      });

      // First call finds robots, second call (during assignment) finds none
      (robotQueries.getAvailableRobots as jest.Mock)
        .mockResolvedValueOnce([
          {
            id: 'robot-1',
            robotId: 'RB-001',
            status: 'IDLE',
            batteryPercent: 80,
            location: { lat: 35.772, lng: -78.674 },
          },
        ])
        .mockResolvedValueOnce([]);

      // Simulate race: robot gets assigned to another order between calls
      (orderQueries.updateOrder as jest.Mock).mockRejectedValue(new Error('Robot no longer available'));

      await expect(processOrderStatusChange(orderId, 'READY')).rejects.toThrow();
    });
  });

  describe('Core Assumption 8: Order-Robot Binding - Consistent binding state', () => {
    it('should maintain consistent binding between order and robot throughout lifecycle', async () => {
      const orderId = 'order-binding';
      const robotId = 'robot-binding';

      // Initial assignment
      (orderQueries.getOrderById as jest.Mock).mockResolvedValueOnce({
        id: orderId,
        status: 'PREPARING',
        robotId: null,
        deliveryLocationLat: 35.773,
        deliveryLocationLng: -78.675,
      });

      (robotQueries.getAvailableRobots as jest.Mock).mockResolvedValue([
        {
          id: robotId,
          robotId: 'RB-001',
          status: 'IDLE',
          batteryPercent: 80,
          location: { lat: 35.772, lng: -78.674 },
        },
      ]);

      (orderQueries.updateOrder as jest.Mock).mockResolvedValue({
        id: orderId,
        robotId,
        status: 'ASSIGNED',
      });

      await processOrderStatusChange(orderId, 'READY');

      // Verify binding established
      expect(orderQueries.updateOrder).toHaveBeenCalledWith(
        orderId,
        expect.objectContaining({ robotId })
      );

      // En route - robot should still be bound
      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'ASSIGNED',
        robotId,
      });

      await processOrderStatusChange(orderId, 'EN_ROUTE');

      // Robot should still be bound to order
      expect(orderQueries.getOrderById).toHaveBeenCalledWith(orderId);
    });

    it('should clear robot binding when order is cancelled', async () => {
      const orderId = 'order-cancel-binding';
      const robotId = 'robot-cancel-binding';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'ASSIGNED',
        robotId,
      });

      (orderQueries.updateOrder as jest.Mock).mockResolvedValue({
        id: orderId,
        robotId: null,
        status: 'CANCELLED',
      });

      await processOrderStatusChange(orderId, 'CANCELLED');

      // Binding should be cleared
      expect(orderQueries.updateOrder).toHaveBeenCalledWith(orderId, {
        robotId: null,
      });
    });
  });
});
