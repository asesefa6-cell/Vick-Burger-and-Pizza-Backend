import { Router } from 'express';
import {
  createPaymentHandler,
  getAllPaymentsHandler,
  getPaymentByIdHandler,
  updatePaymentHandler,
  deletePaymentHandler,
} from '../controllers/paymentController';

// Example usage: app.use('/api/payments', paymentRoutes);

const router = Router();

router.post('/', createPaymentHandler);
router.get('/', getAllPaymentsHandler);
router.get('/:id', getPaymentByIdHandler);
router.put('/:id', updatePaymentHandler);
router.delete('/:id', deletePaymentHandler);

export default router;
