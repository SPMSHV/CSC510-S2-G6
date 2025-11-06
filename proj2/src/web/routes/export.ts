/**
 * Copyright (c) 2025 CampusBot Contributors
 * Licensed under the MIT License
 */

import { Router, Request, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import * as orderQueries from '../../db/queries/orders';
import * as robotQueries from '../../db/queries/robots';
import * as userQueries from '../../db/queries/users';
import * as restaurantQueries from '../../db/queries/restaurants';

export const router = Router();

const backend = process.env.DATA_BACKEND || 'memory';

// Export all data as JSON (admin only)
router.get('/json', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
  try {
    let data: any = {};

    if (backend === 'postgres') {
      data = {
        orders: await orderQueries.getAllOrders(),
        robots: await robotQueries.getAllRobots(),
        users: await userQueries.getAllUsers(),
        restaurants: await restaurantQueries.getAllRestaurants(),
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
    } else {
      // In-memory fallback - export from routes
      const ordersModule = await import('./orders');
      const robotsModule = await import('./robots');
      const usersModule = await import('./users');
      const restaurantsModule = await import('./restaurants');

      data = {
        orders: Object.values(ordersModule.orders),
        robots: Object.values(robotsModule.robots),
        users: Object.values(usersModule.users),
        restaurants: Object.values(restaurantsModule.restaurants),
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=campusbot-export.json');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Export orders as CSV (admin or vendor)
router.get('/orders/csv', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    let orders: orderQueries.Order[] = [];

    if (backend === 'postgres') {
      if (req.user?.role === 'VENDOR') {
        // Vendors can only export their own orders
        orders = await orderQueries.getOrdersByVendorId(req.user.id);
      } else if (req.user?.role === 'ADMIN') {
        orders = await orderQueries.getAllOrders();
      } else {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    } else {
      // In-memory fallback
      const ordersModule = await import('./orders');
      orders = Object.values(ordersModule.orders);

      if (req.user?.role === 'VENDOR') {
        orders = orders.filter((order) => order.vendorId === req.user?.id);
      } else if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    // Convert to CSV
    const headers = ['id', 'userId', 'vendorId', 'status', 'total', 'deliveryLocation', 'createdAt', 'updatedAt'];
    const rows = orders.map((order) => [
      order.id,
      order.userId,
      order.vendorId,
      order.status,
      order.total.toString(),
      order.deliveryLocation,
      order.createdAt || '',
      order.updatedAt || '',
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders-export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export orders', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Import data from JSON (admin only)
router.post('/import', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { orders, robots, users, restaurants } = req.body;

    if (!orders && !robots && !users && !restaurants) {
      return res.status(400).json({ error: 'No data provided for import' });
    }

    const results: any = {
      imported: {},
      errors: [],
    };

    if (backend === 'postgres') {
      // Import to PostgreSQL
      if (users && Array.isArray(users)) {
        try {
          for (const user of users) {
            await userQueries.createUser(user.email, user.name, user.role, user.passwordHash || '');
          }
          results.imported.users = users.length;
        } catch (error) {
          results.errors.push(`Failed to import users: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (restaurants && Array.isArray(restaurants)) {
        try {
          for (const restaurant of restaurants) {
            await restaurantQueries.createRestaurant(
              restaurant.vendorId,
              restaurant.name,
              restaurant.description,
              restaurant.location,
              restaurant.hours,
            );
          }
          results.imported.restaurants = restaurants.length;
        } catch (error) {
          results.errors.push(`Failed to import restaurants: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (robots && Array.isArray(robots)) {
        try {
          for (const robot of robots) {
            await robotQueries.createRobot(robot.robotId, robot.status, robot.batteryPercent, robot.location);
          }
          results.imported.robots = robots.length;
        } catch (error) {
          results.errors.push(`Failed to import robots: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (orders && Array.isArray(orders)) {
        try {
          for (const order of orders) {
            await orderQueries.createOrder(
              order.userId,
              order.vendorId,
              order.items,
              order.deliveryLocation,
              order.deliveryLocationLat,
              order.deliveryLocationLng,
            );
          }
          results.imported.orders = orders.length;
        } catch (error) {
          results.errors.push(`Failed to import orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } else {
      // In-memory import
      results.errors.push('Import is only supported in PostgreSQL mode');
    }

    res.json({
      message: 'Import completed',
      ...results,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import data', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

