import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import * as robotQueries from '../../db/queries/robots';

export const router = Router();

const backend = process.env.DATA_BACKEND || 'memory';

interface Location {
  lat: number;
  lng: number;
}

interface RobotHealth {
  battery_pct: number;
  localization: string;
  motor_temp_c: number[];
  comm_uptime_s: number;
  last_maintenance: string;
  errors: string[];
}

const createSchema = Joi.object({
  robotId: Joi.string().required(),
  status: Joi.string().valid('IDLE', 'ASSIGNED', 'EN_ROUTE', 'CHARGING', 'MAINTENANCE', 'OFFLINE').required(),
  batteryPercent: Joi.number().min(0).max(100).required(),
  location: Joi.object({ lat: Joi.number().required(), lng: Joi.number().required() }).required(),
});

// Fallback in-memory storage for non-postgres backends
const robots: Record<string, robotQueries.Robot & { health: RobotHealth }> = {};

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

router.get('/', async (_req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const allRobots = await robotQueries.getAllRobots();
      // Add health data (mock for now)
      const robotsWithHealth = allRobots.map((robot) => ({
        ...robot,
        health: defaultHealth(),
      }));
      return res.json(robotsWithHealth);
    }
    res.json(Object.values(robots));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch robots' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const robot = await robotQueries.getRobotById(req.params.id);
      if (!robot) return res.status(404).json({ error: 'Robot not found' });
      return res.json({ ...robot, health: defaultHealth() });
    }
    const robot = robots[req.params.id];
    if (!robot) return res.status(404).json({ error: 'Robot not found' });
    res.json(robot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch robot' });
  }
});

router.get('/:id/health', async (req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const robot = await robotQueries.getRobotById(req.params.id);
      if (!robot) return res.status(404).json({ error: 'Robot not found' });
      const health = defaultHealth();
      return res.json({ id: robot.robotId, status: robot.status, ...health });
    }
    const robot = robots[req.params.id];
    if (!robot) return res.status(404).json({ error: 'Robot not found' });
    res.json({ id: robot.robotId, status: robot.status, ...robot.health });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch robot health' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    if (backend === 'postgres') {
      const robot = await robotQueries.createRobot(value.robotId, value.status, value.batteryPercent, value.location);
      return res.status(201).json({ ...robot, health: defaultHealth() });
    }

    const now = new Date().toISOString();
    const id = uuidv4();
    const robot = {
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
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(409).json({ error: 'Robot ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create robot' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const allowed = ['status', 'batteryPercent', 'location'] as const;
      const updates: { status?: robotQueries.Robot['status']; batteryPercent?: number; location?: Location } = {};
      const body = req.body;
      for (const key of allowed) {
        if (key in body && body[key] !== undefined) {
          updates[key] = body[key];
        }
      }
      const robot = await robotQueries.updateRobot(req.params.id, updates);
      if (!robot) return res.status(404).json({ error: 'Robot not found' });
      return res.json({ ...robot, health: defaultHealth() });
    }

    const robot = robots[req.params.id];
    if (!robot) return res.status(404).json({ error: 'Robot not found' });
    const allowed = ['status', 'batteryPercent', 'location'] as const;
    const body = req.body;
    for (const key of allowed) {
      if (key in body && body[key] !== undefined) {
        // @ts-expect-error index
        robot[key] = body[key];
      }
    }
    robot.updatedAt = new Date().toISOString();
    res.json(robot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update robot' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const deleted = await robotQueries.deleteRobot(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Robot not found' });
      return res.status(204).send();
    }
    const robot = robots[req.params.id];
    if (!robot) return res.status(404).json({ error: 'Robot not found' });
    delete robots[req.params.id];
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete robot' });
  }
});
