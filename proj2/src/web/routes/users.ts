import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import * as userQueries from '../../db/queries/users';

export const router = Router();

const backend = process.env.DATA_BACKEND || 'memory';

const createSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).required(),
  role: Joi.string().valid('STUDENT', 'VENDOR', 'ADMIN', 'ENGINEER').required(),
});

const updateSchema = Joi.object({
  email: Joi.string().email(),
  name: Joi.string().min(2),
  role: Joi.string().valid('STUDENT', 'VENDOR', 'ADMIN', 'ENGINEER'),
}).min(1);

// Fallback in-memory storage for non-postgres backends
export const users: Record<string, userQueries.User> = {};

router.get('/', async (_req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const allUsers = await userQueries.getAllUsers();
      return res.json(allUsers);
    }
    res.json(Object.values(users));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const user = await userQueries.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json(user);
    }
    const user = users[req.params.id];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    if (backend === 'postgres') {
      const user = await userQueries.createUser(value.email, value.name, value.role);
      return res.status(201).json(user);
    }

    const now = new Date().toISOString();
    const id = uuidv4();
    const user: userQueries.User = {
      id,
      email: value.email,
      name: value.name,
      role: value.role,
      createdAt: now,
      updatedAt: now,
    };
    users[id] = user;
    res.status(201).json(user);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { error, value } = updateSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ error: error.message });

    if (backend === 'postgres') {
      const user = await userQueries.updateUser(req.params.id, value);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json(user);
    }

    const user = users[req.params.id];
    if (!user) return res.status(404).json({ error: 'User not found' });
    Object.assign(user, value);
    user.updatedAt = new Date().toISOString();
    res.json(user);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const deleted = await userQueries.deleteUser(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'User not found' });
      return res.status(204).send();
    }
    const user = users[req.params.id];
    if (!user) return res.status(404).json({ error: 'User not found' });
    delete users[req.params.id];
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});
