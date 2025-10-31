import { Router, Request, Response } from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail, createUser } from '../../db/queries/users';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth';

export const router = Router();

const backend = process.env.DATA_BACKEND || 'memory';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('STUDENT', 'VENDOR', 'ADMIN', 'ENGINEER').default('STUDENT'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// In-memory fallback for non-postgres backends
const users: Record<string, { id: string; email: string; name: string; role: string; passwordHash: string }> = {};

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { email, name, password, role } = value;
    const passwordHash = await bcrypt.hash(password, 10);

    if (backend === 'postgres') {
      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const user = await createUser(email, name, role, passwordHash);
      const token = generateToken(user.id, user.email, user.role);
      return res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      });
    }

    // In-memory fallback
    const existingUser = Object.values(users).find((u) => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const id = uuidv4();
    const user = { id, email, name, role: role || 'STUDENT', passwordHash };
    users[id] = user;
    const token = generateToken(id, email, role || 'STUDENT');
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { email, password } = value;

    if (backend === 'postgres') {
      const userRow = await getUserByEmail(email);
      if (!userRow || !userRow.password_hash) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isValid = await bcrypt.compare(password, userRow.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(userRow.id, userRow.email, userRow.role);
      return res.json({
        user: {
          id: userRow.id,
          email: userRow.email,
          name: userRow.name,
          role: userRow.role,
        },
        token,
      });
    }

    // In-memory fallback
    const user = Object.values(users).find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.email, user.role);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (backend === 'postgres') {
      const { getUserById } = await import('../../db/queries/users');
      const user = await getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    }

    // In-memory fallback
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

