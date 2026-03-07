import { Router } from 'express';
import Joi from 'joi';
import {
  placeOrderHandler,
  updateOrderStatusHandler,
  processPaymentHandler,
  confirmManualPaymentHandler,
  getAllHandler,
  getByIdHandler,
  updateHandler,
  deleteHandler,
} from './controller';
import { validateBody, validateParams } from '../_shared/validation';
import { authenticate } from '../../middlewares/authMiddleware';
import { authorize } from '../../middlewares/roleMiddleware';
import { allowAdminAndSuperAdmin, allowAllPrivileged, allowAllStaff } from '../_shared/rbac';

// Example usage: app.use('/api/orders', orderRoutes);

const router = Router();
const uuid = Joi.string().guid({ version: 'uuidv4' });

const placeOrderSchema = Joi.object({
  tableId: uuid.required(),
  paymentMethod: Joi.string().min(1).optional(),
  items: Joi.array()
    .items(
      Joi.object({
        itemId: uuid.required(),
        quantity: Joi.number().integer().positive().required(),
        specialInstruction: Joi.string().optional(),
      })
    )
    .min(1)
    .required(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Preparing', 'Ready', 'Delivered').required(),
});

const paymentSchema = Joi.object({
  provider: Joi.string().valid('Chapa', 'AddisPay', 'CardDemo').required(),
  paymentMethod: Joi.string().min(1).required(),
  transactionReference: Joi.string().optional(),
});
const confirmPaymentSchema = Joi.object({
  paymentMethod: Joi.string().min(1).optional(),
  status: Joi.string().valid('Paid', 'Unpaid').required(),
});

const adminUpdateSchema = Joi.object({
  tableId: uuid.optional(),
  status: Joi.string().optional(),
  totalAmount: Joi.string().optional(),
});

const idParams = Joi.object({ id: uuid.required() });

router.post('/place', validateBody(placeOrderSchema), placeOrderHandler);
router.patch('/:id/status', authenticate, authorize(allowAllPrivileged), validateParams(idParams), validateBody(updateStatusSchema), updateOrderStatusHandler);
router.post('/:id/pay', validateParams(idParams), validateBody(paymentSchema), processPaymentHandler);
router.post('/:id/confirm-payment', authenticate, authorize(allowAllStaff), validateParams(idParams), validateBody(confirmPaymentSchema), confirmManualPaymentHandler);

router.get('/', authenticate, authorize(allowAdminAndSuperAdmin), getAllHandler);
router.get('/:id', authenticate, authorize(allowAdminAndSuperAdmin), validateParams(idParams), getByIdHandler);
router.put('/:id', authenticate, authorize(allowAdminAndSuperAdmin), validateParams(idParams), validateBody(adminUpdateSchema), updateHandler);
router.delete('/:id', authenticate, authorize(allowAdminAndSuperAdmin), validateParams(idParams), deleteHandler);

export default router;
