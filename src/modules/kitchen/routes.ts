import { Router } from 'express';
import Joi from 'joi';
import { getActiveOrdersHandler, kitchenAnalyticsHandler, updateStatusHandler } from './controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { authorize } from '../../middlewares/roleMiddleware';
import { allowAdminChefWaiter } from '../_shared/rbac';
import { validateBody, validateParams } from '../_shared/validation';

// Example usage: app.use('/api/kitchen', kitchenRoutes);

const router = Router();
const uuid = Joi.string().guid({ version: 'uuidv4' });

const statusSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Preparing', 'Ready', 'Delivered').required(),
});

const idParams = Joi.object({ id: uuid.required() });

router.get('/orders/active', authenticate, authorize(allowAdminChefWaiter), getActiveOrdersHandler);
router.get('/analytics', authenticate, authorize(allowAdminChefWaiter), kitchenAnalyticsHandler);
router.patch('/orders/:id/status', authenticate, authorize(allowAdminChefWaiter), validateParams(idParams), validateBody(statusSchema), updateStatusHandler);

export default router;
