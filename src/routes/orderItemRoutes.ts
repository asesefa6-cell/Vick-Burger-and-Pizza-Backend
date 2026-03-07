import { Router } from 'express';
import {
  createOrderItemHandler,
  getAllOrderItemsHandler,
  getOrderItemByIdHandler,
  updateOrderItemHandler,
  deleteOrderItemHandler,
} from '../controllers/orderItemController';

// Example usage: app.use('/api/order-items', orderItemRoutes);

const router = Router();

router.post('/', createOrderItemHandler);
router.get('/', getAllOrderItemsHandler);
router.get('/:id', getOrderItemByIdHandler);
router.put('/:id', updateOrderItemHandler);
router.delete('/:id', deleteOrderItemHandler);

export default router;
