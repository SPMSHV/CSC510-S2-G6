import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

export const router = Router();

type OrderStatus = 'CREATED' | 'PREPARING' | 'READY' | 'ASSIGNED' | 'EN_ROUTE' | 'DELIVERED' | 'CANCELLED';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  vendorId: string;
  items: OrderItem[];
  total: number;
  deliveryLocation: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

const createSchema = Joi.object({
  userId: Joi.string().required(),
  vendorId: Joi.string().required(),
  items: Joi.array()
    .items(Joi.object({ name: Joi.string().required(), quantity: Joi.number().integer().min(1).required(), price: Joi.number().min(0).required() }))
    .min(1)
    .required(),
  deliveryLocation: Joi.string().required(),
});

const updateSchema = Joi.object({
  status: Joi.string()
    .valid('CREATED', 'PREPARING', 'READY', 'ASSIGNED', 'EN_ROUTE', 'DELIVERED', 'CANCELLED')
    .required(),
});

const orders: Record<string, Order> = {};

function computeTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

router.get('/', (_req: Request, res: Response) => {
  res.json(Object.values(orders));
});

router.get('/:id', (req: Request, res: Response) => {
  const order = orders[req.params.id];
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

router.post('/', (req: Request, res: Response) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const now = new Date().toISOString();
  const id = uuidv4();
  const total = computeTotal(value.items);
  const order: Order = {
    id,
    userId: value.userId,
    vendorId: value.vendorId,
    items: value.items,
    total,
    deliveryLocation: value.deliveryLocation,
    status: 'CREATED',
    createdAt: now,
    updatedAt: now,
  };
  orders[id] = order;
  res.status(201).json(order);
});

router.patch('/:id', (req: Request, res: Response) => {
  const order = orders[req.params.id];
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const { error, value } = updateSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  order.status = value.status as OrderStatus;
  order.updatedAt = new Date().toISOString();
  res.json(order);
});

router.delete('/:id', (req: Request, res: Response) => {
  const order = orders[req.params.id];
  if (!order) return res.status(404).json({ error: 'Order not found' });
  delete orders[req.params.id];
  res.status(204).send();
});
