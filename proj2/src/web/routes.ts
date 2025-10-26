import { Router } from 'express';
import { router as ordersRouter } from './routes/orders';
import { router as robotsRouter } from './routes/robots';
import { router as usersRouter } from './routes/users';

export const router = Router();

router.use('/orders', ordersRouter);
router.use('/robots', robotsRouter);
router.use('/users', usersRouter);
