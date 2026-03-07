import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../../middlewares/authMiddleware';
import { authorize } from '../../middlewares/roleMiddleware';
import { allowAdminAndManager } from '../_shared/rbac';
import { requireBusinessAccess } from './middleware';
import { validateQuery } from '../_shared/validation';
import {
  dailyReportHandler,
  weeklyReportHandler,
  monthlyReportHandler,
  orderStatusReportHandler,
} from './reports.controller';

// Example usage: app.use('/reports', reportRoutes);

const router = Router();
const uuid = Joi.string().guid({ version: 'uuidv4' });

const businessQuerySchema = Joi.object({
  businessId: uuid.optional(),
});

router.use(authenticate, authorize(allowAdminAndManager), requireBusinessAccess);

router.get('/daily', validateQuery(businessQuerySchema), dailyReportHandler);
router.get('/weekly', validateQuery(businessQuerySchema), weeklyReportHandler);
router.get('/monthly', validateQuery(businessQuerySchema), monthlyReportHandler);
router.get('/order-status', validateQuery(businessQuerySchema), orderStatusReportHandler);

export default router;
