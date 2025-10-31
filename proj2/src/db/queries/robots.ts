import { getPool } from '../client';

export interface RobotRow {
  id: string;
  robot_id: string;
  status: 'IDLE' | 'ASSIGNED' | 'EN_ROUTE' | 'CHARGING' | 'MAINTENANCE' | 'OFFLINE';
  battery_percent: number;
  location_lat: string;
  location_lng: string;
  created_at: Date;
  updated_at: Date;
}

export interface Robot {
  id: string;
  robotId: string;
  status: 'IDLE' | 'ASSIGNED' | 'EN_ROUTE' | 'CHARGING' | 'MAINTENANCE' | 'OFFLINE';
  batteryPercent: number;
  location: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
}

function rowToRobot(row: RobotRow): Robot {
  return {
    id: row.id,
    robotId: row.robot_id,
    status: row.status,
    batteryPercent: row.battery_percent,
    location: { lat: parseFloat(row.location_lat), lng: parseFloat(row.location_lng) },
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getAllRobots(): Promise<Robot[]> {
  const pool = getPool();
  const result = await pool.query<RobotRow>('SELECT * FROM robots ORDER BY created_at DESC');
  return result.rows.map(rowToRobot);
}

export async function getRobotById(id: string): Promise<Robot | null> {
  const pool = getPool();
  const result = await pool.query<RobotRow>('SELECT * FROM robots WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  return rowToRobot(result.rows[0]);
}

export async function getRobotByRobotId(robotId: string): Promise<Robot | null> {
  const pool = getPool();
  const result = await pool.query<RobotRow>('SELECT * FROM robots WHERE robot_id = $1', [robotId]);
  if (result.rows.length === 0) return null;
  return rowToRobot(result.rows[0]);
}

export async function getAvailableRobots(): Promise<Robot[]> {
  const pool = getPool();
  const result = await pool.query<RobotRow>(
    "SELECT * FROM robots WHERE status = 'IDLE' AND battery_percent > 20 ORDER BY battery_percent DESC",
  );
  return result.rows.map(rowToRobot);
}

export async function createRobot(
  robotId: string,
  status: 'IDLE' | 'ASSIGNED' | 'EN_ROUTE' | 'CHARGING' | 'MAINTENANCE' | 'OFFLINE',
  batteryPercent: number,
  location: { lat: number; lng: number },
): Promise<Robot> {
  const pool = getPool();
  const result = await pool.query<RobotRow>(
    'INSERT INTO robots (robot_id, status, battery_percent, location_lat, location_lng) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [robotId, status, batteryPercent, location.lat, location.lng],
  );
  return rowToRobot(result.rows[0]);
}

export async function updateRobot(
  id: string,
  updates: {
    status?: 'IDLE' | 'ASSIGNED' | 'EN_ROUTE' | 'CHARGING' | 'MAINTENANCE' | 'OFFLINE';
    batteryPercent?: number;
    location?: { lat: number; lng: number };
  },
): Promise<Robot | null> {
  const pool = getPool();
  const setClause: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.status !== undefined) {
    setClause.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.batteryPercent !== undefined) {
    setClause.push(`battery_percent = $${paramIndex++}`);
    values.push(updates.batteryPercent);
  }
  if (updates.location !== undefined) {
    setClause.push(`location_lat = $${paramIndex++}`);
    setClause.push(`location_lng = $${paramIndex++}`);
    values.push(updates.location.lat, updates.location.lng);
  }

  if (setClause.length === 0) {
    return getRobotById(id);
  }

  setClause.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  const query = `UPDATE robots SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await pool.query<RobotRow>(query, values);
  if (result.rows.length === 0) return null;
  return rowToRobot(result.rows[0]);
}

export async function deleteRobot(id: string): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query('DELETE FROM robots WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

