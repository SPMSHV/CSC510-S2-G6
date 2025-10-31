import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import * as orderQueries from '../../db/queries/orders';
import * as robotQueries from '../../db/queries/robots';
import { processOrderStatusChange } from '../../services/robotAssignment';
import { getOrderTrackingInfo, getOrderProgress } from '../../services/orderTracking';
import { authenticate, AuthRequest } from '../middleware/auth';

export const router = Router();

const backend = process.env.DATA_BACKEND || 'memory';

const createSchema = Joi.object({
  userId: Joi.string().required(),
  vendorId: Joi.string().required(),
  items: Joi.array()
    .items(Joi.object({ name: Joi.string().required(), quantity: Joi.number().integer().min(1).required(), price: Joi.number().min(0).required() }))
    .min(1)
    .required(),
  deliveryLocation: Joi.string().required(),
  deliveryLocationLat: Joi.number().optional(),
  deliveryLocationLng: Joi.number().optional(),
});

const updateSchema = Joi.object({
  status: Joi.string()
    .valid('CREATED', 'PREPARING', 'READY', 'ASSIGNED', 'EN_ROUTE', 'DELIVERED', 'CANCELLED')
    .required(),
});

// Fallback in-memory storage for non-postgres backends
const orders: Record<string, orderQueries.Order> = {};

function computeTotal(items: orderQueries.OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const allOrders = await orderQueries.getAllOrders();
      return res.json(allOrders);
    }
    res.json(Object.values(orders));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get orders for current user (must be before /:id route)
router.get('/my-orders', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (backend === 'postgres') {
      const userOrders = await orderQueries.getOrdersByUserId(req.userId);
      return res.json(userOrders);
    }

    const userOrders = Object.values(orders).filter((order) => order.userId === req.userId);
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const order = await orderQueries.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      return res.json(order);
    }
    const order = orders[req.params.id];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    if (backend === 'postgres') {
      const order = await orderQueries.createOrder(
        value.userId,
        value.vendorId,
        value.items,
        value.deliveryLocation,
        value.deliveryLocationLat,
        value.deliveryLocationLng,
      );
      return res.status(201).json(order);
    }

    const now = new Date().toISOString();
    const id = uuidv4();
    const total = computeTotal(value.items);
    const order: orderQueries.Order = {
      id,
      userId: value.userId,
      vendorId: value.vendorId,
      robotId: null,
      items: value.items,
      total,
      deliveryLocation: value.deliveryLocation,
      deliveryLocationLat: value.deliveryLocationLat || null,
      deliveryLocationLng: value.deliveryLocationLng || null,
      status: 'CREATED',
      createdAt: now,
      updatedAt: now,
    };
    orders[id] = order;
    res.status(201).json(order);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('foreign key')) {
      return res.status(400).json({ error: 'Invalid user_id or vendor_id' });
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    if (backend === 'postgres') {
      // First update the order status
      const order = await orderQueries.updateOrder(req.params.id, { status: value.status });
      if (!order) return res.status(404).json({ error: 'Order not found' });

      // Then process status change which may trigger robot assignment
      await processOrderStatusChange(req.params.id, value.status);
      
      // Fetch updated order to return latest state
      const updatedOrder = await orderQueries.getOrderById(req.params.id);
      return res.json(updatedOrder || order);
    }

    const order = orders[req.params.id];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = value.status as orderQueries.Order['status'];
    order.updatedAt = new Date().toISOString();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Get order tracking information with progress
router.get('/:id/track', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (backend === 'postgres') {
      const trackingInfo = await getOrderTrackingInfo(req.params.id);
      if (!trackingInfo) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check if user owns this order
      if (trackingInfo.order.userId !== req.userId && req.user?.role !== 'ADMIN' && req.user?.role !== 'VENDOR') {
        return res.status(403).json({ error: 'Not authorized to view this order' });
      }

      return res.json(trackingInfo);
    }

    const order = orders[req.params.id];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId !== req.userId && req.user?.role !== 'ADMIN' && req.user?.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const progress = getOrderProgress(order.status);
    res.json({
      order,
      progress,
      robot: null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracking information' });
  }
});

// Get order status with progress (optimized for polling)
router.get('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (backend === 'postgres') {
      const order = await orderQueries.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check if user owns this order
      if (order.userId !== req.userId && req.user?.role !== 'ADMIN' && req.user?.role !== 'VENDOR') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const progress = getOrderProgress(order.status);
      let robotLocation = null;

      if (order.robotId) {
        const robot = await robotQueries.getRobotById(order.robotId);
        if (robot) {
          robotLocation = robot.location;
        }
      }

      return res.json({
        status: order.status,
        progress: progress.progress,
        statusLabel: progress.statusLabel,
        estimatedTimeToNext: progress.estimatedTimeToNext,
        robotLocation,
        updatedAt: order.updatedAt,
      });
    }

    const order = orders[req.params.id];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId !== req.userId && req.user?.role !== 'ADMIN' && req.user?.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const progress = getOrderProgress(order.status);
    res.json({
      status: order.status,
      progress: progress.progress,
      statusLabel: progress.statusLabel,
      estimatedTimeToNext: progress.estimatedTimeToNext,
      robotLocation: null,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order status' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const deleted = await orderQueries.deleteOrder(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Order not found' });
      return res.status(204).send();
    }
    const order = orders[req.params.id];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    delete orders[req.params.id];
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});
