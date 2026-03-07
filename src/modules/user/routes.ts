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

// Example usage: app.use('/api/users', userRoutes);

const router = Router();
const uuid = Joi.string().guid({ version: 'uuidv4' });

const createSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  passwordHash: Joi.string().min(1).required(),
  roleId: uuid.required(),
  businessId: uuid.optional(),
});

const updateSchema = createSchema.fork(Object.keys(createSchema.describe().keys), (schema) => schema.optional());
const idParams = Joi.object({ id: uuid.required() });

router.post('/', authenticate, authorize(allowAdminAndSuperAdmin), validateBody(createSchema), createHandler);
router.get('/', authenticate, authorize(allowAdminAndSuperAdmin), getAllHandler);
router.get('/:id', authenticate, authorize(allowAdminAndSuperAdmin), validateParams(idParams), getByIdHandler);
router.put('/:id', authenticate, authorize(allowAdminAndSuperAdmin), validateParams(idParams), validateBody(updateSchema), updateHandler);
router.delete('/:id', authenticate, authorize(allowAdminAndSuperAdmin), validateParams(idParams), deleteHandler);

export default router;
