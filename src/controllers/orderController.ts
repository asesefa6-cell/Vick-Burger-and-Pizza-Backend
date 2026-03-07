import { Request, Response, NextFunction } from 'express';
import {
  createOrder,
  findAllOrders,
  findOrderById,
  updateOrder,
  deleteOrder,
} from '../services/orderService';

// Example route usage:
// router.post('/orders', createOrderHandler);

export const createOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await createOrder(req.body);
    res.status(201).json({ success: true, message: 'Order created', data: order });
  } catch (error) {
    next(error);
  }
};

export const getAllOrdersHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await findAllOrders();
    res.status(200).json({ success: true, message: 'Orders fetched', data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await findOrderById(Number(req.params.id));
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order fetched', data: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await updateOrder(Number(req.params.id), req.body);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order updated', data: order });
  } catch (error) {
    next(error);
  }
};

export const deleteOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await deleteOrder(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order deleted' });
  } catch (error) {
    next(error);
  }
};
