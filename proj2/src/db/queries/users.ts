import { getPool } from '../client';

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'VENDOR' | 'ADMIN' | 'ENGINEER';
  password_hash: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'VENDOR' | 'ADMIN' | 'ENGINEER';
  createdAt: string;
  updatedAt: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getAllUsers(): Promise<User[]> {
  const pool = getPool();
  const result = await pool.query<UserRow>('SELECT * FROM users ORDER BY created_at DESC');
  return result.rows.map(rowToUser);
}

export async function getUserById(id: string): Promise<User | null> {
  const pool = getPool();
  const result = await pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  return rowToUser(result.rows[0]);
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const pool = getPool();
  const result = await pool.query<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
}

export async function createUser(
  email: string,
  name: string,
  role: 'STUDENT' | 'VENDOR' | 'ADMIN' | 'ENGINEER',
  passwordHash?: string,
): Promise<User> {
  const pool = getPool();
  const result = await pool.query<UserRow>(
    'INSERT INTO users (email, name, role, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
    [email, name, role, passwordHash || null],
  );
  return rowToUser(result.rows[0]);
}

export async function updateUser(
  id: string,
  updates: { email?: string; name?: string; role?: 'STUDENT' | 'VENDOR' | 'ADMIN' | 'ENGINEER'; passwordHash?: string },
): Promise<User | null> {
  const pool = getPool();
  const setClause: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.email !== undefined) {
    setClause.push(`email = $${paramIndex++}`);
    values.push(updates.email);
  }
  if (updates.name !== undefined) {
    setClause.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.role !== undefined) {
    setClause.push(`role = $${paramIndex++}`);
    values.push(updates.role);
  }
  if (updates.passwordHash !== undefined) {
    setClause.push(`password_hash = $${paramIndex++}`);
    values.push(updates.passwordHash);
  }

  if (setClause.length === 0) {
    return getUserById(id);
  }

  setClause.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  const query = `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await pool.query<UserRow>(query, values);
  if (result.rows.length === 0) return null;
  return rowToUser(result.rows[0]);
}

export async function deleteUser(id: string): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

