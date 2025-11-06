import { Router } from 'express';
import { router as ordersRouter } from './routes/orders';
import { router as robotsRouter } from './routes/robots';
import { router as usersRouter } from './routes/users';
import { router as authRouter } from './routes/auth';
import { router as restaurantsRouter } from './routes/restaurants';
import { router as telemetryRouter } from './routes/telemetry';
import { router as exportRouter } from './routes/export';

export const router = Router();

router.use('/auth', authRouter);
router.use('/orders', ordersRouter);
router.use('/robots', robotsRouter);
router.use('/users', usersRouter);
router.use('/restaurants', restaurantsRouter);
router.use('/telemetry', telemetryRouter);
router.use('/export', exportRouter);
