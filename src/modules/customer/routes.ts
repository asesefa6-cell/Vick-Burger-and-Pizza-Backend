import { Router } from 'express';
import Joi from 'joi';
import {
  getTableByQrHandler,
  getMenuForTableHandler,
  placeCustomerOrderHandler,
  processCustomerPaymentHandler,
  getPaymentMethodsForTableHandler,
  initChapaPaymentHandler,
  verifyChapaPaymentHandler,
  submitCustomerRatingHandler,
} from './controller';
import { validateBody, validateParams } from '../_shared/validation';

// Example usage: app.use('/api/customer', customerRoutes);

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

const paymentSchema = Joi.object({
  provider: Joi.string().valid('Chapa', 'AddisPay', 'CardDemo').required(),
  paymentMethod: Joi.string().min(1).required(),
  transactionReference: Joi.string().optional(),
});

const tableParams = Joi.object({ tableId: uuid.required() });
const idParams = Joi.object({ id: uuid.required() });
const ratingSchema = Joi.object({ rating: Joi.number().integer().min(1).max(5).required() });

router.get('/qr/:code', getTableByQrHandler);
router.get('/menu/:tableId', validateParams(tableParams), getMenuForTableHandler);
router.get('/payment-methods/:tableId', validateParams(tableParams), getPaymentMethodsForTableHandler);
router.post('/orders', validateBody(placeOrderSchema), placeCustomerOrderHandler);
router.post('/orders/:id/pay', validateParams(idParams), validateBody(paymentSchema), processCustomerPaymentHandler);
router.post('/orders/:id/chapa/init', validateParams(idParams), initChapaPaymentHandler);
router.get('/orders/:id/chapa/verify', validateParams(idParams), verifyChapaPaymentHandler);
router.post('/tables/:tableId/rate', validateParams(tableParams), validateBody(ratingSchema), submitCustomerRatingHandler);

export default router;
