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
import { allowAdminManagerAndSuperAdmin } from '../_shared/rbac';

// Example usage: app.use('/api/categories', categoryRoutes);

const router = Router();
const uuid = Joi.string().guid({ version: 'uuidv4' });

const createSchema = Joi.object({
  categoryName: Joi.string().min(1).required(),
  description: Joi.string().optional(),
  businessId: uuid.required(),
});

const updateSchema = createSchema.fork(Object.keys(createSchema.describe().keys), (schema) => schema.optional());
const idParams = Joi.object({ id: uuid.required() });

router.post('/', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateBody(createSchema), createHandler);
router.get('/', authenticate, authorize(allowAdminManagerAndSuperAdmin), getAllHandler);
router.get('/:id', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(idParams), getByIdHandler);
router.put('/:id', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(idParams), validateBody(updateSchema), updateHandler);
router.delete('/:id', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(idParams), deleteHandler);

export default router;
