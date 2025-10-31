import { getPool } from '../client';

export interface RestaurantRow {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  location_lat: string | null;
  location_lng: string | null;
  hours: Record<string, string> | null;
  created_at: Date;
  updated_at: Date;
}

export interface Restaurant {
  id: string;
  vendorId: string;
  name: string;
  description: string | null;
  location: { lat: number; lng: number } | null;
  hours: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

function rowToRestaurant(row: RestaurantRow): Restaurant {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    name: row.name,
    description: row.description,
    location:
      row.location_lat && row.location_lng
        ? { lat: parseFloat(row.location_lat), lng: parseFloat(row.location_lng) }
        : null,
    hours: row.hours,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getAllRestaurants(): Promise<Restaurant[]> {
  const pool = getPool();
  const result = await pool.query<RestaurantRow>('SELECT * FROM restaurants ORDER BY created_at DESC');
  return result.rows.map(rowToRestaurant);
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const pool = getPool();
  const result = await pool.query<RestaurantRow>('SELECT * FROM restaurants WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  return rowToRestaurant(result.rows[0]);
}

export async function getRestaurantByVendorId(vendorId: string): Promise<Restaurant | null> {
  const pool = getPool();
  const result = await pool.query<RestaurantRow>('SELECT * FROM restaurants WHERE vendor_id = $1', [vendorId]);
  if (result.rows.length === 0) return null;
  return rowToRestaurant(result.rows[0]);
}

export async function createRestaurant(
  vendorId: string,
  name: string,
  description?: string,
  location?: { lat: number; lng: number },
  hours?: Record<string, string>,
): Promise<Restaurant> {
  const pool = getPool();
  const result = await pool.query<RestaurantRow>(
    `INSERT INTO restaurants (vendor_id, name, description, location_lat, location_lng, hours)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb) RETURNING *`,
    [vendorId, name, description || null, location?.lat || null, location?.lng || null, hours ? JSON.stringify(hours) : null],
  );
  return rowToRestaurant(result.rows[0]);
}

export async function updateRestaurant(
  id: string,
  updates: {
    name?: string;
    description?: string;
    location?: { lat: number; lng: number };
    hours?: Record<string, string>;
  },
): Promise<Restaurant | null> {
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
  if (updates.location !== undefined) {
    setClause.push(`location_lat = $${paramIndex++}`);
    setClause.push(`location_lng = $${paramIndex++}`);
    values.push(updates.location.lat, updates.location.lng);
  }
  if (updates.hours !== undefined) {
    setClause.push(`hours = $${paramIndex++}::jsonb`);
    values.push(JSON.stringify(updates.hours));
  }

  if (setClause.length === 0) {
    return getRestaurantById(id);
  }

  setClause.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  const query = `UPDATE restaurants SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await pool.query<RestaurantRow>(query, values);
  if (result.rows.length === 0) return null;
  return rowToRestaurant(result.rows[0]);
}

export async function deleteRestaurant(id: string): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query('DELETE FROM restaurants WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

