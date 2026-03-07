import { Router } from 'express';
import Joi from 'joi';
import { salesReportHandler, analyticsHandler } from './controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { authorize } from '../../middlewares/roleMiddleware';
import { allowAdminManagerAndSuperAdmin } from '../_shared/rbac';
import { validateQuery } from '../_shared/validation';

// Example usage: app.use('/api/reports', reportRoutes);

const router = Router();
const uuid = Joi.string().guid({ version: 'uuidv4' });

const periodSchema = Joi.string().valid('daily', 'weekly', 'monthly').required();

const salesQuerySchema = Joi.object({
  period: periodSchema,
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  tableId: uuid.optional(),
  categoryId: uuid.optional(),
  paymentMethod: Joi.string().min(1).optional(),
});

const analyticsQuerySchema = Joi.object({
  period: periodSchema,
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  businessId: uuid.optional(),
});

router.get('/sales', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateQuery(salesQuerySchema), salesReportHandler);
router.get('/analytics', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateQuery(analyticsQuerySchema), analyticsHandler);

export default router;
