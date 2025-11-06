import * as robotQueries from '../db/queries/robots';
import * as orderQueries from '../db/queries/orders';
import { getReadyOrdersWithoutRobotsFromMemory, orders } from '../web/routes/orders';
import { getAvailableRobotsFromMemory, robots } from '../web/routes/robots';
import { telemetryService } from './telemetry';

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
 * Backend-agnostic function to get ready orders without robots
 */
async function getReadyOrdersWithoutRobots(): Promise<orderQueries.Order[]> {
  const backend = process.env.DATA_BACKEND || 'memory';
  if (backend === 'postgres') {
    return await orderQueries.getReadyOrdersWithoutRobots();
  }
  return getReadyOrdersWithoutRobotsFromMemory();
}

/**
 * Backend-agnostic function to get all robots
 */
async function getAllRobots(): Promise<robotQueries.Robot[]> {
  const backend = process.env.DATA_BACKEND || 'memory';
  if (backend === 'postgres') {
    return await robotQueries.getAllRobots();
  }
  return Object.values(robots).map((robot) => ({
    id: robot.id,
    robotId: robot.robotId,
    status: robot.status,
    batteryPercent: robot.batteryPercent,
    location: robot.location,
    createdAt: robot.createdAt,
    updatedAt: robot.updatedAt,
  }));
}

/**
 * Backend-agnostic function to get available robots
 */
async function getAvailableRobots(): Promise<robotQueries.Robot[]> {
  const backend = process.env.DATA_BACKEND || 'memory';
  if (backend === 'postgres') {
    return await robotQueries.getAvailableRobots();
  }
  return getAvailableRobotsFromMemory();
}

/**
 * Backend-agnostic function to find nearest available robot
 */
async function findNearestAvailableRobot(
  deliveryLat: number,
  deliveryLng: number,
): Promise<robotQueries.Robot | null> {
  const availableRobots = await getAvailableRobots();
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
 * Backend-agnostic function to assign robot to order
 */
async function assignRobotToOrder(orderId: string, robotId: string): Promise<void> {
  const backend = process.env.DATA_BACKEND || 'memory';

  if (backend === 'postgres') {
    // Update order with robot_id and status to ASSIGNED
    await orderQueries.updateOrder(orderId, { robotId, status: 'ASSIGNED' });
    // Update robot status to ASSIGNED
    await robotQueries.updateRobot(robotId, { status: 'ASSIGNED' });
  } else {
    // Memory backend: update in-memory objects
    const order = orders[orderId];
    const robot = robots[robotId];
    if (order && robot) {
      order.robotId = robotId;
      order.status = 'ASSIGNED';
      order.updatedAt = new Date().toISOString();
      robot.status = 'ASSIGNED';
      robot.updatedAt = new Date().toISOString();
    }
  }
}

/**
 * Sync database robot states to telemetry robots for dashboard display
 */
async function syncTelemetryRobots(): Promise<void> {
  try {
    const allRobots = await getAllRobots();
    // Sync first 5 robots to telemetry (telemetry has 5 robots)
    const robotsToSync = allRobots.slice(0, 5).map((robot) => ({ status: robot.status }));
    telemetryService.syncWithDatabaseRobots(robotsToSync);
  } catch (error) {
    // Log error but don't crash
     
    console.error('[Robot Assignment] Error syncing telemetry robots:', error);
  }
}

/**
 * Process waiting ready orders and assign robots
 */
async function processWaitingReadyOrders(): Promise<void> {
  try {
    const readyOrders = await getReadyOrdersWithoutRobots();
    let assigned = false;

    for (const order of readyOrders) {
      try {
        // Only process orders with delivery coordinates
        if (!order.deliveryLocationLat || !order.deliveryLocationLng) {
          continue;
        }

        const nearestRobot = await findNearestAvailableRobot(
          order.deliveryLocationLat,
          order.deliveryLocationLng,
        );

        if (nearestRobot) {
          await assignRobotToOrder(order.id, nearestRobot.id);
          assigned = true;
           
          console.log(`[Robot Assignment] Assigned robot ${nearestRobot.robotId} to order ${order.id}`);
        }
      } catch (error) {
        // Log error but continue processing other orders
         
        console.error(`[Robot Assignment] Failed to assign robot to order ${order.id}:`, error);
      }
    }

    // Sync telemetry robots after assignments to update dashboard
    if (assigned) {
      await syncTelemetryRobots();
    }
  } catch (error) {
    // Log error but don't crash the service
     
    console.error('[Robot Assignment] Error processing waiting orders:', error);
  }
}

/**
 * Order Assignment Service - polls for ready orders and assigns robots
 */
class OrderAssignmentService {
  private intervalId: NodeJS.Timeout | null = null;
  private running: boolean = false;
  private pollInterval: number;

  constructor(pollIntervalSeconds: number = 15) {
    this.pollInterval = pollIntervalSeconds * 1000; // Convert to milliseconds
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    // Run immediately on start, then poll at intervals
    processWaitingReadyOrders();
    // Also sync telemetry robots on startup
    syncTelemetryRobots();

    this.intervalId = setInterval(() => {
      processWaitingReadyOrders();
      // Periodically sync telemetry robots to keep dashboard in sync
      syncTelemetryRobots();
    }, this.pollInterval);

     
    console.log(`[Order Assignment Service] Started polling every ${this.pollInterval / 1000} seconds`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running = false;
     
    console.log('[Order Assignment Service] Stopped');
  }

  isRunning(): boolean {
    return this.running;
  }
}

export const orderAssignmentService = new OrderAssignmentService(
  parseInt(process.env.ROBOT_ASSIGNMENT_POLL_INTERVAL || '15', 10),
);

export function maybeStartOrderAssignmentService(): void {
  const enabled = process.env.ENABLE_ROBOT_ASSIGNMENT_POLLING !== '0'; // Default to enabled

  if (enabled) {
    orderAssignmentService.start();
  }
}

