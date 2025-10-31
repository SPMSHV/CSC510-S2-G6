import { createServer } from '../../src/server';
import jwt from 'jsonwebtoken';

export function createApp() {
  return createServer();
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Create a JWT token for testing purposes
 */
export function createAuthToken(userId: string, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}
