/**
 * Copyright (c) 2025 CampusBot Team - Group 6
 * Pranshav Gajjar, Aniruddh Sanjeev Bhagwat, Ishan Patel, Hardik Majethia, and Contributors
 *
 * MIT License
 * See LICENSE.md for full license text
 */

import * as orderQueries from '../db/queries/orders';
import * as robotQueries from '../db/queries/robots';

export interface OrderStatusProgress {
  status: orderQueries.Order['status'];
  progress: number; // 0-100
  statusLabel: string;
  estimatedTimeToNext?: number; // minutes
}

/**
 * Get progress percentage based on order status
 */
export function getOrderProgress(status: orderQueries.Order['status']): OrderStatusProgress {
  const statusMap: Record<orderQueries.Order['status'], { progress: number; label: string; nextTime?: number }> = {
    CREATED: { progress: 0, label: 'Order Created', nextTime: 2 },
    PREPARING: { progress: 25, label: 'Preparing Your Order', nextTime: 10 },
    READY: { progress: 50, label: 'Ready for Pickup', nextTime: 5 },
    ASSIGNED: { progress: 60, label: 'Robot Assigned', nextTime: 3 },
    EN_ROUTE: { progress: 80, label: 'On The Way', nextTime: 15 },
    DELIVERED: { progress: 100, label: 'Delivered', nextTime: undefined },
    CANCELLED: { progress: 0, label: 'Cancelled', nextTime: undefined },
  };

  const statusInfo = statusMap[status];
  return {
    status,
    progress: statusInfo.progress,
    statusLabel: statusInfo.label,
    estimatedTimeToNext: statusInfo.nextTime,
  };
}

export interface OrderTrackingInfo {
  order: orderQueries.Order;
  progress: OrderStatusProgress;
  robot: robotQueries.Robot | null;
  estimatedDeliveryTime?: number; // minutes
}

/**
 * Get comprehensive order tracking information
 */
export async function getOrderTrackingInfo(orderId: string): Promise<OrderTrackingInfo | null> {
  const order = await orderQueries.getOrderById(orderId);
  if (!order) {
    return null;
  }

  const progress = getOrderProgress(order.status);
  let robot: robotQueries.Robot | null = null;

  if (order.robotId) {
    robot = await robotQueries.getRobotById(order.robotId);
  }

  // Calculate estimated delivery time
  let estimatedDeliveryTime: number | undefined;
  if (order.status === 'EN_ROUTE' && robot && order.deliveryLocationLat && order.deliveryLocationLng) {
    // Simple estimation: assume average speed of 5 km/h for delivery robots
    const distance =
      Math.sqrt(
        Math.pow(robot.location.lat - order.deliveryLocationLat, 2) +
          Math.pow(robot.location.lng - order.deliveryLocationLng, 2),
      ) * 111; // rough km conversion
    estimatedDeliveryTime = Math.max(5, Math.ceil(distance / 5) * 60); // minutes
  } else if (progress.estimatedTimeToNext) {
    estimatedDeliveryTime = progress.estimatedTimeToNext;
  }

  return {
    order,
    progress,
    robot,
    estimatedDeliveryTime,
  };
}

