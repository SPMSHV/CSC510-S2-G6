import { getPool } from '../client';

export interface MenuItemRow {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

function rowToMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    category: row.category,
    available: row.available,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getMenuItemsByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
  const pool = getPool();
  const result = await pool.query<MenuItemRow>('SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY category, name', [restaurantId]);
  return result.rows.map(rowToMenuItem);
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const pool = getPool();
  const result = await pool.query<MenuItemRow>('SELECT * FROM menu_items WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  return rowToMenuItem(result.rows[0]);
}

export async function createMenuItem(
  restaurantId: string,
  name: string,
  price: number,
  description?: string,
  category?: string,
  available?: boolean,
): Promise<MenuItem> {
  const pool = getPool();
  const result = await pool.query<MenuItemRow>(
    `INSERT INTO menu_items (restaurant_id, name, description, price, category, available)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [restaurantId, name, description || null, price, category || null, available !== undefined ? available : true],
  );
  return rowToMenuItem(result.rows[0]);
}

export async function updateMenuItem(
  id: string,
  updates: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    available?: boolean;
  },
): Promise<MenuItem | null> {
  const pool = getPool();
  const setClause: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    setClause.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    setClause.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }
  if (updates.price !== undefined) {
    setClause.push(`price = $${paramIndex++}`);
    values.push(updates.price);
  }
  if (updates.category !== undefined) {
    setClause.push(`category = $${paramIndex++}`);
    values.push(updates.category);
  }
  if (updates.available !== undefined) {
    setClause.push(`available = $${paramIndex++}`);
    values.push(updates.available);
  }

  if (setClause.length === 0) {
    return getMenuItemById(id);
  }

  setClause.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  const query = `UPDATE menu_items SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await pool.query<MenuItemRow>(query, values);
  if (result.rows.length === 0) return null;
  return rowToMenuItem(result.rows[0]);
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query('DELETE FROM menu_items WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

