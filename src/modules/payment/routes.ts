import { Router } from 'express';
import Joi from 'joi';
import {
  createHandler,
  getAllHandler,
  getByIdHandler,
  updateHandler,
  deleteHandler,
} from './controller';
import { validateBody, validateParams } from '../_shared/validation';
import { authenticate } from '../../middlewares/authMiddleware';
import { authorize } from '../../middlewares/roleMiddleware';
import { allowAdminAndSuperAdmin } from '../_shared/rbac';

// Example usage: app.use('/api/payments', paymentRoutes);

const router = Router();
const uuid = Joi.string().guid({ version: 'uuidv4' });

const createSchema = Joi.object({
  orderId: uuid.required(),
  paymentMethod: Joi.string().min(1).required(),
  paymentStatus: Joi.string().min(1).required(),
  transactionReference: Joi.string().optional(),
  paymentDate: Joi.date().iso().optional(),
});

const updateSchema = createSchema.fork(Object.keys(createSchema.describe().keys), (schema) => schema.optional());
const idParams = Joi.object({ id: uuid.required() });

router.post('/', authenticate, authorize(allowAdminAndSuperAdmin), validateBody(createSchema), createHandler);
router.get('/', authenticate, authorize(allowAdminAndSuperAdmin), getAllHandler);
router.get('/:id', authenticate, authorize(allowAdminAndSuperAdmin), validateParams(idParams), getByIdHandler);
router.put('/:id', authenticate, authorize(allowAdminAndSuperAdmin), validateParams(idParams), validateBody(updateSchema), updateHandler);
router.delete('/:id', authenticate, authorize(allowAdminAndSuperAdmin), validateParams(idParams), deleteHandler);

export default router;
