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
import { allowAdminAndSuperAdmin, allowAllPrivileged } from '../_shared/rbac';

// Example usage: app.use('/api/order-items', orderItemRoutes);

const router = Router();
const uuid = Joi.string().guid({ version: 'uuidv4' });

const createSchema = Joi.object({
  orderId: uuid.required(),
  itemId: uuid.required(),
  quantity: Joi.number().integer().positive().required(),
  specialInstruction: Joi.string().optional(),
});

const updateSchema = createSchema.fork(Object.keys(createSchema.describe().keys), (schema) => schema.optional());
const idParams = Joi.object({ id: uuid.required() });

router.post('/', authenticate, authorize(allowAdminAndSuperAdmin), validateBody(createSchema), createHandler);
router.get('/', authenticate, authorize(allowAdminAndSuperAdmin), getAllHandler);
router.get('/:id', authenticate, authorize(allowAdminAndSuperAdmin), validateParams(idParams), getByIdHandler);
router.put('/:id', authenticate, authorize(allowAllPrivileged), validateParams(idParams), validateBody(updateSchema), updateHandler);
router.delete('/:id', authenticate, authorize(allowAdminAndSuperAdmin), validateParams(idParams), deleteHandler);

export default router;
