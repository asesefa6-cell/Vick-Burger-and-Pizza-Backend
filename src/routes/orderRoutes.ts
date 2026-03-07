import { Router } from 'express';
import {
  createOrderHandler,
  getAllOrdersHandler,
  getOrderByIdHandler,
  updateOrderHandler,
  deleteOrderHandler,
} from '../controllers/orderController';

// Example usage: app.use('/api/orders', orderRoutes);

const router = Router();

router.post('/', createOrderHandler);
router.get('/', getAllOrdersHandler);
router.get('/:id', getOrderByIdHandler);
router.put('/:id', updateOrderHandler);
router.delete('/:id', deleteOrderHandler);

export default router;
