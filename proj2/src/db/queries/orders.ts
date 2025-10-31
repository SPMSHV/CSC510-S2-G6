import { getPool } from '../client';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderRow {
  id: string;
  user_id: string;
  vendor_id: string;
  robot_id: string | null;
  items: OrderItem[];
  total: string;
  delivery_location: string;
  delivery_location_lat: string | null;
  delivery_location_lng: string | null;
  status: 'CREATED' | 'PREPARING' | 'READY' | 'ASSIGNED' | 'EN_ROUTE' | 'DELIVERED' | 'CANCELLED';
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: string;
  userId: string;
  vendorId: string;
  robotId: string | null;
  items: OrderItem[];
  total: number;
  deliveryLocation: string;
  deliveryLocationLat: number | null;
  deliveryLocationLng: number | null;
  status: 'CREATED' | 'PREPARING' | 'READY' | 'ASSIGNED' | 'EN_ROUTE' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.user_id,
    vendorId: row.vendor_id,
    robotId: row.robot_id,
    items: row.items,
    total: parseFloat(row.total),
    deliveryLocation: row.delivery_location,
    deliveryLocationLat: row.delivery_location_lat ? parseFloat(row.delivery_location_lat) : null,
    deliveryLocationLng: row.delivery_location_lng ? parseFloat(row.delivery_location_lng) : null,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getAllOrders(): Promise<Order[]> {
  const pool = getPool();
  const result = await pool.query<OrderRow>('SELECT * FROM orders ORDER BY created_at DESC');
  return result.rows.map(rowToOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const pool = getPool();
  const result = await pool.query<OrderRow>('SELECT * FROM orders WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  return rowToOrder(result.rows[0]);
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const pool = getPool();
  const result = await pool.query<OrderRow>('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return result.rows.map(rowToOrder);
}

export async function getOrdersByVendorId(vendorId: string): Promise<Order[]> {
  const pool = getPool();
  const result = await pool.query<OrderRow>('SELECT * FROM orders WHERE vendor_id = $1 ORDER BY created_at DESC', [vendorId]);
  return result.rows.map(rowToOrder);
}

export async function getOrdersByStatus(status: Order['status']): Promise<Order[]> {
  const pool = getPool();
  const result = await pool.query<OrderRow>('SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC', [status]);
  return result.rows.map(rowToOrder);
}

export async function createOrder(
  userId: string,
  vendorId: string,
  items: OrderItem[],
  deliveryLocation: string,
  deliveryLocationLat?: number,
  deliveryLocationLng?: number,
): Promise<Order> {
  const pool = getPool();
  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const result = await pool.query<OrderRow>(
    `INSERT INTO orders (user_id, vendor_id, items, total, delivery_location, delivery_location_lat, delivery_location_lng, status)
     VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, 'CREATED') RETURNING *`,
    [userId, vendorId, JSON.stringify(items), total, deliveryLocation, deliveryLocationLat || null, deliveryLocationLng || null],
  );
  return rowToOrder(result.rows[0]);
}

export async function updateOrder(
  id: string,
  updates: {
    status?: 'CREATED' | 'PREPARING' | 'READY' | 'ASSIGNED' | 'EN_ROUTE' | 'DELIVERED' | 'CANCELLED';
    robotId?: string | null;
  },
): Promise<Order | null> {
  const pool = getPool();
  const setClause: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.status !== undefined) {
    setClause.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.robotId !== undefined) {
    setClause.push(`robot_id = $${paramIndex++}`);
    values.push(updates.robotId);
  }

  if (setClause.length === 0) {
    return getOrderById(id);
  }

  setClause.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  const query = `UPDATE orders SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await pool.query<OrderRow>(query, values);
  if (result.rows.length === 0) return null;
  return rowToOrder(result.rows[0]);
}

export async function deleteOrder(id: string): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

