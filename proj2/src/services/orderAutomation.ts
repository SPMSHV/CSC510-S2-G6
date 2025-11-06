import * as orderQueries from '../db/queries/orders';
import * as robotQueries from '../db/queries/robots';
import { processOrderStatusChange } from './robotAssignment';
import { orders } from '../web/routes/orders';
import { robots } from '../web/routes/robots';

/**
 * Order Automation Service
 * Automatically transitions orders through the delivery lifecycle:
 * ASSIGNED → EN_ROUTE → DELIVERED
 */

const ASSIGNED_TO_EN_ROUTE_DELAY = parseInt(process.env.ASSIGNED_TO_EN_ROUTE_DELAY || '30', 10) * 1000; // Default: 30 seconds
const EN_ROUTE_TO_DELIVERED_DELAY = parseInt(process.env.EN_ROUTE_TO_DELIVERED_DELAY || '60', 10) * 1000; // Default: 1 minute

interface OrderTimer {
  orderId: string;
  timeout: NodeJS.Timeout;
  targetStatus: 'EN_ROUTE' | 'DELIVERED';
}

class OrderAutomationService {
  private timers: Map<string, OrderTimer> = new Map();
  private running: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;

  /**
   * Schedule automatic transitions for an order
   */
  async scheduleTransitions(orderId: string): Promise<void> {
    const backend = process.env.DATA_BACKEND || 'memory';
    let order: orderQueries.Order | null;

    if (backend === 'postgres') {
      order = await orderQueries.getOrderById(orderId);
    } else {
      order = orders[orderId] || null;
    }

    if (!order) {
      // eslint-disable-next-line no-console
      console.log(`[Order Automation] Order ${orderId} not found, skipping automation`);
      return;
    }

    // Clear any existing timers for this order
    this.clearTimers(orderId);

    if (order.status === 'ASSIGNED') {
      // Schedule transition to EN_ROUTE
      // eslint-disable-next-line no-console
      console.log(`[Order Automation] Scheduling ASSIGNED → EN_ROUTE transition for order ${orderId} in ${ASSIGNED_TO_EN_ROUTE_DELAY / 1000} seconds`);
      const timeout = setTimeout(async () => {
        await this.transitionToEnRoute(orderId);
      }, ASSIGNED_TO_EN_ROUTE_DELAY);
      
      this.timers.set(orderId, {
        orderId,
        timeout,
        targetStatus: 'EN_ROUTE',
      });
    } else if (order.status === 'EN_ROUTE') {
      // Schedule transition to DELIVERED
      // eslint-disable-next-line no-console
      console.log(`[Order Automation] Scheduling EN_ROUTE → DELIVERED transition for order ${orderId} in ${EN_ROUTE_TO_DELIVERED_DELAY / 1000} seconds`);
      const timeout = setTimeout(async () => {
        await this.transitionToDelivered(orderId);
      }, EN_ROUTE_TO_DELIVERED_DELAY);
      
      this.timers.set(orderId, {
        orderId,
        timeout,
        targetStatus: 'DELIVERED',
      });
    } else {
      // eslint-disable-next-line no-console
      console.log(`[Order Automation] Order ${orderId} is in ${order.status} status, no automation needed`);
    }
  }

  /**
   * Transition order from ASSIGNED to EN_ROUTE
   */
  private async transitionToEnRoute(orderId: string): Promise<void> {
    const backend = process.env.DATA_BACKEND || 'memory';
    let order: orderQueries.Order | null;

    if (backend === 'postgres') {
      order = await orderQueries.getOrderById(orderId);
    } else {
      order = orders[orderId] || null;
    }

    if (!order || order.status !== 'ASSIGNED') {
      this.timers.delete(orderId);
      return;
    }

    try {
      if (backend === 'postgres') {
        await orderQueries.updateOrder(orderId, { status: 'EN_ROUTE' });
        await processOrderStatusChange(orderId, 'EN_ROUTE');
      } else {
        // Memory backend
        order.status = 'EN_ROUTE';
        order.updatedAt = new Date().toISOString();
        if (order.robotId) {
          const robot = robots[order.robotId];
          if (robot) {
            robot.status = 'EN_ROUTE';
            robot.updatedAt = new Date().toISOString();
          }
        }
      }

      // eslint-disable-next-line no-console
      console.log(`[Order Automation] Order ${orderId} transitioned from ASSIGNED to EN_ROUTE`);

      // Schedule next transition
      await this.scheduleTransitions(orderId);
      this.timers.delete(orderId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[Order Automation] Failed to transition order ${orderId} to EN_ROUTE:`, error);
      this.timers.delete(orderId);
    }
  }

  /**
   * Transition order from EN_ROUTE to DELIVERED
   */
  private async transitionToDelivered(orderId: string): Promise<void> {
    const backend = process.env.DATA_BACKEND || 'memory';
    let order: orderQueries.Order | null;

    if (backend === 'postgres') {
      order = await orderQueries.getOrderById(orderId);
    } else {
      order = orders[orderId] || null;
    }

    if (!order || order.status !== 'EN_ROUTE') {
      this.timers.delete(orderId);
      return;
    }

    try {
      if (backend === 'postgres') {
        await orderQueries.updateOrder(orderId, { status: 'DELIVERED' });
        await processOrderStatusChange(orderId, 'DELIVERED');
      } else {
        // Memory backend
        order.status = 'DELIVERED';
        order.updatedAt = new Date().toISOString();
        if (order.robotId) {
          const robot = robots[order.robotId];
          if (robot) {
            robot.status = 'IDLE';
            robot.updatedAt = new Date().toISOString();
            if (order.deliveryLocationLat && order.deliveryLocationLng) {
              robot.location = { lat: order.deliveryLocationLat, lng: order.deliveryLocationLng };
            }
          }
        }
      }

      // eslint-disable-next-line no-console
      console.log(`[Order Automation] Order ${orderId} transitioned from EN_ROUTE to DELIVERED`);
      this.timers.delete(orderId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[Order Automation] Failed to transition order ${orderId} to DELIVERED:`, error);
      this.timers.delete(orderId);
    }
  }

  /**
   * Clear timers for an order
   */
  clearTimers(orderId: string): void {
    const timer = this.timers.get(orderId);
    if (timer) {
      clearTimeout(timer.timeout);
      this.timers.delete(orderId);
    }
  }

  /**
   * Start polling for orders that need automation
   */
  start(): void {
    if (this.running) return;

    this.running = true;
    const pollIntervalSeconds = parseInt(process.env.ORDER_AUTOMATION_POLL_INTERVAL || '30', 10);
    
    // Run immediately on start
    this.processPendingOrders();

    // Then poll at intervals
    this.pollInterval = setInterval(() => {
      this.processPendingOrders();
    }, pollIntervalSeconds * 1000);

    // eslint-disable-next-line no-console
    console.log(`[Order Automation Service] Started polling every ${pollIntervalSeconds} seconds`);
  }

  /**
   * Stop the automation service
   */
  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer.timeout);
    }
    this.timers.clear();
    this.running = false;

    // eslint-disable-next-line no-console
    console.log('[Order Automation Service] Stopped');
  }

  /**
   * Process pending orders that need automation
   */
  private async processPendingOrders(): Promise<void> {
    try {
      const backend = process.env.DATA_BACKEND || 'memory';
      let assignedOrders: orderQueries.Order[] = [];
      let enRouteOrders: orderQueries.Order[] = [];

      if (backend === 'postgres') {
        assignedOrders = await orderQueries.getOrdersByStatus('ASSIGNED');
        enRouteOrders = await orderQueries.getOrdersByStatus('EN_ROUTE');
      } else {
        // Memory backend
        assignedOrders = Object.values(orders).filter((o) => o.status === 'ASSIGNED');
        enRouteOrders = Object.values(orders).filter((o) => o.status === 'EN_ROUTE');
      }

      // eslint-disable-next-line no-console
      console.log(`[Order Automation] Polling: Found ${assignedOrders.length} ASSIGNED orders, ${enRouteOrders.length} EN_ROUTE orders`);

      // Schedule transitions for orders that don't have timers yet
      for (const order of assignedOrders) {
        if (!this.timers.has(order.id)) {
          // eslint-disable-next-line no-console
          console.log(`[Order Automation] Found ASSIGNED order ${order.id} without timer, scheduling transition`);
          await this.scheduleTransitions(order.id);
        }
      }

      for (const order of enRouteOrders) {
        if (!this.timers.has(order.id)) {
          // eslint-disable-next-line no-console
          console.log(`[Order Automation] Found EN_ROUTE order ${order.id} without timer, scheduling transition`);
          await this.scheduleTransitions(order.id);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Order Automation Service] Error processing pending orders:', error);
    }
  }

  isRunning(): boolean {
    return this.running;
  }
}

export const orderAutomationService = new OrderAutomationService();

export function maybeStartOrderAutomation(): void {
  const enabled = process.env.ENABLE_ORDER_AUTOMATION !== '0'; // Default to enabled

  if (enabled) {
    orderAutomationService.start();
  }
}

