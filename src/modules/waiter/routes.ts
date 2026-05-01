import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware';
import { authorize } from '../../middlewares/roleMiddleware';
import { allowWaiterOnly } from '../_shared/rbac';
import Joi from 'joi';
import { validateParams } from '../_shared/validation';
import { getAssignedTablesHandler, completeTableVisitHandler, waiterAnalyticsHandler } from './waiterController';

// Example usage: app.use('/api/waiter', waiterRoutes);

const router = Router();

router.get('/tables/assigned', authenticate, authorize(allowWaiterOnly), getAssignedTablesHandler);
router.get('/analytics', authenticate, authorize(allowWaiterOnly), waiterAnalyticsHandler);
const tableParams = Joi.object({ tableId: Joi.string().guid({ version: 'uuidv4' }).required() });
router.post('/tables/:tableId/complete', authenticate, authorize(allowWaiterOnly), validateParams(tableParams), completeTableVisitHandler);

export default router;
