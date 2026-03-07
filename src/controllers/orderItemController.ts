import { Request, Response, NextFunction } from 'express';
import {
  createOrderItem,
  findAllOrderItems,
  findOrderItemById,
  updateOrderItem,
  deleteOrderItem,
} from '../services/orderItemService';

// Example route usage:
// router.post('/order-items', createOrderItemHandler);

export const createOrderItemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderItem = await createOrderItem(req.body);
    res.status(201).json({ success: true, message: 'Order item created', data: orderItem });
  } catch (error) {
    next(error);
  }
};

export const getAllOrderItemsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderItems = await findAllOrderItems();
    res.status(200).json({ success: true, message: 'Order items fetched', data: orderItems });
  } catch (error) {
    next(error);
  }
};

export const getOrderItemByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderItem = await findOrderItemById(Number(req.params.id));
    if (!orderItem) {
      res.status(404).json({ success: false, message: 'Order item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order item fetched', data: orderItem });
  } catch (error) {
    next(error);
  }
};

export const updateOrderItemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderItem = await updateOrderItem(Number(req.params.id), req.body);
    if (!orderItem) {
      res.status(404).json({ success: false, message: 'Order item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order item updated', data: orderItem });
  } catch (error) {
    next(error);
  }
};

export const deleteOrderItemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await deleteOrderItem(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Order item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order item deleted' });
  } catch (error) {
    next(error);
  }
};
