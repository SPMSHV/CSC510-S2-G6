import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

export const router = Router();

type UserRole = 'STUDENT' | 'VENDOR' | 'ADMIN' | 'ENGINEER';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

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

const users: Record<string, User> = {};

router.get('/', (_req: Request, res: Response) => {
  res.json(Object.values(users));
});

router.get('/:id', (req: Request, res: Response) => {
  const user = users[req.params.id];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.post('/', (req: Request, res: Response) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const now = new Date().toISOString();
  const id = uuidv4();
  const user: User = { id, email: value.email, name: value.name, role: value.role, createdAt: now, updatedAt: now };
  users[id] = user;
  res.status(201).json(user);
});

router.patch('/:id', (req: Request, res: Response) => {
  const user = users[req.params.id];
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { error, value } = updateSchema.validate(req.body, { allowUnknown: false });
  if (error) return res.status(400).json({ error: error.message });
  Object.assign(user, value);
  user.updatedAt = new Date().toISOString();
  res.json(user);
});

router.delete('/:id', (req: Request, res: Response) => {
  const user = users[req.params.id];
  if (!user) return res.status(404).json({ error: 'User not found' });
  delete users[req.params.id];
  res.status(204).send();
});
