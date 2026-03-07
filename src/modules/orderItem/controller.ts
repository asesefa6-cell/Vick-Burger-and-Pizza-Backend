import { Request, Response, NextFunction } from 'express';
import {
  createOrderItem,
  findAllOrderItems,
  findOrderItemById,
  updateOrderItem,
  deleteOrderItem,
} from './service';
import { parseIdParam } from '../_shared/validation';

export const createHandler = async (
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

export const getAllHandler = async (
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

export const getByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (id === null) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const orderItem = await findOrderItemById(id);
    if (!orderItem) {
      res.status(404).json({ success: false, message: 'Order item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order item fetched', data: orderItem });
  } catch (error) {
    next(error);
  }
};

export const updateHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (id === null) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const orderItem = await updateOrderItem(id, req.body);
    if (!orderItem) {
      res.status(404).json({ success: false, message: 'Order item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order item updated', data: orderItem });
  } catch (error) {
    next(error);
  }
};

export const deleteHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (id === null) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const deleted = await deleteOrderItem(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Order item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order item deleted' });
  } catch (error) {
    next(error);
  }
};
