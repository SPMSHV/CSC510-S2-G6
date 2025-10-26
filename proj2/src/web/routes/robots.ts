import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

export const router = Router();

type RobotStatus = 'IDLE' | 'ASSIGNED' | 'EN_ROUTE' | 'CHARGING' | 'MAINTENANCE' | 'OFFLINE';

interface Location { lat: number; lng: number }

interface RobotHealth {
  battery_pct: number;
  localization: string;
  motor_temp_c: number[];
  comm_uptime_s: number;
  last_maintenance: string;
  errors: string[];
}

interface Robot {
  id: string; // UUID
  robotId: string; // human-readable (e.g., RB-07)
  status: RobotStatus;
  batteryPercent: number;
  location: Location;
  health: RobotHealth;
  createdAt: string;
  updatedAt: string;
}

const createSchema = Joi.object({
  robotId: Joi.string().required(),
  status: Joi.string().valid('IDLE', 'ASSIGNED', 'EN_ROUTE', 'CHARGING', 'MAINTENANCE', 'OFFLINE').required(),
  batteryPercent: Joi.number().min(0).max(100).required(),
  location: Joi.object({ lat: Joi.number().required(), lng: Joi.number().required() }).required(),
});

const robots: Record<string, Robot> = {};

function defaultHealth(): RobotHealth {
  return {
    battery_pct: 90,
    localization: 'LIDAR_OK+GPS_OK',
    motor_temp_c: [40, 39, 41, 38],
    comm_uptime_s: 3600,
    last_maintenance: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
    errors: [],
  };
}

router.get('/', (_req: Request, res: Response) => {
  res.json(Object.values(robots));
});

router.get('/:id', (req: Request, res: Response) => {
  const robot = robots[req.params.id];
  if (!robot) return res.status(404).json({ error: 'Robot not found' });
  res.json(robot);
});

router.get('/:id/health', (req: Request, res: Response) => {
  const robot = robots[req.params.id];
  if (!robot) return res.status(404).json({ error: 'Robot not found' });
  res.json({ id: robot.robotId, status: robot.status, ...robot.health });
});

router.post('/', (req: Request, res: Response) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const now = new Date().toISOString();
  const id = uuidv4();
  const robot: Robot = {
    id,
    robotId: value.robotId,
    status: value.status,
    batteryPercent: value.batteryPercent,
    location: value.location,
    health: defaultHealth(),
    createdAt: now,
    updatedAt: now,
  };
  robots[id] = robot;
  res.status(201).json(robot);
});

router.patch('/:id', (req: Request, res: Response) => {
  const robot = robots[req.params.id];
  if (!robot) return res.status(404).json({ error: 'Robot not found' });
  const allowed = ['status', 'batteryPercent', 'location'] as const;
  const body = req.body as Partial<Robot>;
  for (const key of allowed) {
    if (key in body && body[key] !== undefined) {
      // @ts-expect-error index
      robot[key] = body[key] as any;
    }
  }
  robot.updatedAt = new Date().toISOString();
  res.json(robot);
});

router.delete('/:id', (req: Request, res: Response) => {
  const robot = robots[req.params.id];
  if (!robot) return res.status(404).json({ error: 'Robot not found' });
  delete robots[req.params.id];
  res.status(204).send();
});
