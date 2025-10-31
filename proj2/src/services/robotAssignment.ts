import * as robotQueries from '../db/queries/robots';
import * as orderQueries from '../db/queries/orders';

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Find the nearest available robot to a given location
 */
export async function findNearestAvailableRobot(
  deliveryLat: number,
  deliveryLng: number,
): Promise<robotQueries.Robot | null> {
  const availableRobots = await robotQueries.getAvailableRobots();
  if (availableRobots.length === 0) {
    return null;
  }

  // Find robot with minimum distance
  let nearestRobot: robotQueries.Robot | null = null;
  let minDistance = Infinity;

  for (const robot of availableRobots) {
    const distance = calculateDistance(deliveryLat, deliveryLng, robot.location.lat, robot.location.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestRobot = robot;
    }
  }

  return nearestRobot;
}

/**
 * Assign a robot to an order
 */
export async function assignRobotToOrder(orderId: string, robotId: string): Promise<void> {
  // Update order with robot_id and status to ASSIGNED
  await orderQueries.updateOrder(orderId, { robotId, status: 'ASSIGNED' });

  // Update robot status to ASSIGNED
  await robotQueries.updateRobot(robotId, { status: 'ASSIGNED' });
}

/**
 * Process order status change and automatically assign robot when order becomes READY
 * Note: This should be called AFTER updating the order status
 */
export async function processOrderStatusChange(orderId: string, newStatus: orderQueries.Order['status']): Promise<void> {
  const order = await orderQueries.getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // If order status is now READY and no robot is assigned yet, assign one
  if (newStatus === 'READY' && !order.robotId && order.deliveryLocationLat && order.deliveryLocationLng) {
    const nearestRobot = await findNearestAvailableRobot(order.deliveryLocationLat, order.deliveryLocationLng);
    if (nearestRobot) {
      await assignRobotToOrder(orderId, nearestRobot.id);
    }
    // If no robot available, order stays in READY status until a robot becomes available
  }

  // If order status is now EN_ROUTE, update robot status
  if (newStatus === 'EN_ROUTE' && order.robotId) {
    await robotQueries.updateRobot(order.robotId, { status: 'EN_ROUTE' });
  }

  // If order is delivered, free up the robot
  if (newStatus === 'DELIVERED' && order.robotId) {
    await robotQueries.updateRobot(order.robotId, { status: 'IDLE' });
    // Update robot location to delivery location
    if (order.deliveryLocationLat && order.deliveryLocationLng) {
      await robotQueries.updateRobot(order.robotId, {
        location: { lat: order.deliveryLocationLat, lng: order.deliveryLocationLng },
      });
    }
  }

  // If order is cancelled, free up the robot if one was assigned
  if (newStatus === 'CANCELLED' && order.robotId) {
    await robotQueries.updateRobot(order.robotId, { status: 'IDLE' });
    await orderQueries.updateOrder(orderId, { robotId: null });
  }
}

