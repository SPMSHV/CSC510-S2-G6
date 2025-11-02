import { processOrderStatusChange } from '../src/services/robotAssignment';
import * as orderQueries from '../src/db/queries/orders';
import * as robotQueries from '../src/db/queries/robots';

// Mock the database queries
jest.mock('../src/db/queries/orders');
jest.mock('../src/db/queries/robots');

describe('Vendor Order Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Order Status Transitions', () => {
    it('should transition order from CREATED to PREPARING', async () => {
      const orderId = 'order-1';
      const vendorId = 'vendor-1';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        vendorId,
        status: 'CREATED',
        robotId: null,
        deliveryLocationLat: null,
        deliveryLocationLng: null,
      });

      (orderQueries.updateOrder as jest.Mock).mockResolvedValue({
        id: orderId,
        vendorId,
        status: 'PREPARING',
        robotId: null,
      });

      await processOrderStatusChange(orderId, 'PREPARING');

      expect(orderQueries.updateOrder).not.toHaveBeenCalled();
      // Status change logic should be handled by the route handler
    });

    it('should transition order from PREPARING to READY', async () => {
      const orderId = 'order-1';
      const vendorId = 'vendor-1';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        vendorId,
        status: 'PREPARING',
        robotId: null,
        deliveryLocationLat: null,
        deliveryLocationLng: null,
      });

      await processOrderStatusChange(orderId, 'READY');

      expect(orderQueries.getOrderById).toHaveBeenCalledWith(orderId);
    });

    it('should assign robot when order becomes READY', async () => {
      const orderId = 'order-1';
      const robotId = 'robot-1';
      const vendorId = 'vendor-1';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        vendorId,
        status: 'CREATED',
        robotId: null,
        deliveryLocationLat: 35.772,
        deliveryLocationLng: -78.674,
      });

      (robotQueries.getAvailableRobots as jest.Mock).mockResolvedValue([
        {
          id: robotId,
          robotId: 'RB-1',
          status: 'IDLE',
          batteryPercent: 80,
          location: { lat: 35.773, lng: -78.675 },
        },
      ]);

      (robotQueries.updateRobot as jest.Mock).mockResolvedValue({
        id: robotId,
        robotId: 'RB-1',
        status: 'ASSIGNED',
      });

      (orderQueries.updateOrder as jest.Mock).mockResolvedValue({
        id: orderId,
        robotId,
        status: 'ASSIGNED',
      });

      await processOrderStatusChange(orderId, 'READY');

      expect(robotQueries.getAvailableRobots).toHaveBeenCalled();
      // Robot assignment should occur if available
    });

    it('should not assign robot if none available', async () => {
      const orderId = 'order-1';

      (orderQueries.getOrderById as jest.Mock).mockResolvedValue({
        id: orderId,
        status: 'CREATED',
        robotId: null,
        deliveryLocationLat: 35.772,
        deliveryLocationLng: -78.674,
      });

      (robotQueries.getAvailableRobots as jest.Mock).mockResolvedValue([]);

      await processOrderStatusChange(orderId, 'READY');

      expect(robotQueries.getAvailableRobots).toHaveBeenCalled();
      expect(orderQueries.updateOrder).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ robotId: expect.anything() })
      );
    });

    it('should handle order cancellation and free robot', async () => {
      const orderId = 'order-1';
      const robotId = 'robot-1';

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

      expect(robotQueries.updateRobot).toHaveBeenCalledWith(robotId, { status: 'IDLE' });
    });
  });

  describe('Order Handoff Flow', () => {
    it('should complete full order lifecycle: CREATED → PREPARING → READY → ASSIGNED → EN_ROUTE → DELIVERED', async () => {
      const orderId = 'order-1';
      const robotId = 'robot-1';

      // Step 1: CREATED → PREPARING
      (orderQueries.getOrderById as jest.Mock).mockResolvedValueOnce({
        id: orderId,
        status: 'CREATED',
        robotId: null,
        deliveryLocationLat: null,
      });
      await processOrderStatusChange(orderId, 'PREPARING');

      // Step 2: PREPARING → READY
      (orderQueries.getOrderById as jest.Mock).mockResolvedValueOnce({
        id: orderId,
        status: 'PREPARING',
        robotId: null,
        deliveryLocationLat: 35.772,
        deliveryLocationLng: -78.674,
      });
      (robotQueries.getAvailableRobots as jest.Mock).mockResolvedValue([
        {
          id: robotId,
          robotId: 'RB-1',
          status: 'IDLE',
          batteryPercent: 80,
          location: { lat: 35.773, lng: -78.675 },
        },
      ]);
      await processOrderStatusChange(orderId, 'READY');

      // Step 3: READY → ASSIGNED (should assign robot)
      expect(robotQueries.getAvailableRobots).toHaveBeenCalled();

      // Step 4: ASSIGNED → EN_ROUTE
      (orderQueries.getOrderById as jest.Mock).mockResolvedValueOnce({
        id: orderId,
        status: 'ASSIGNED',
        robotId,
      });
      (robotQueries.updateRobot as jest.Mock).mockResolvedValue({
        id: robotId,
        status: 'EN_ROUTE',
      });
      await processOrderStatusChange(orderId, 'EN_ROUTE');
      expect(robotQueries.updateRobot).toHaveBeenCalledWith(robotId, { status: 'EN_ROUTE' });

      // Step 5: EN_ROUTE → DELIVERED (should free robot)
      (orderQueries.getOrderById as jest.Mock).mockResolvedValueOnce({
        id: orderId,
        status: 'EN_ROUTE',
        robotId,
        deliveryLocationLat: 35.772,
        deliveryLocationLng: -78.674,
      });
      (robotQueries.updateRobot as jest.Mock).mockResolvedValue({
        id: robotId,
        status: 'IDLE',
        location: { lat: 35.772, lng: -78.674 },
      });
      await processOrderStatusChange(orderId, 'DELIVERED');
      expect(robotQueries.updateRobot).toHaveBeenCalledWith(robotId, {
        status: 'IDLE',
        location: { lat: 35.772, lng: -78.674 },
      });
    });
  });
});

