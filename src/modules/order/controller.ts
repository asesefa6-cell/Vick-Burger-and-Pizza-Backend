import { Request, Response, NextFunction } from 'express';
import {
  placeOrder,
  updateOrderStatus,
  processPayment,
  confirmManualPayment,
  updateOrder,
  findAllOrders,
  findOrderById,
  deleteOrder,
} from './service';
import { parseIdParam } from '../_shared/validation';

const canUpdateStatus = (role: string | undefined, status: string): boolean => {
  if (!role) return false;
  if (role === 'Admin' || role === 'Super Admin') return true;
  if (role === 'Chef') return status === 'Preparing' || status === 'Ready';
  if (role === 'Waiter') return status === 'Delivered';
  return false;
};

export const placeOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await placeOrder(req.body);
    res.status(201).json({ success: true, message: 'Order placed', data: order });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid table') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === 'No items in order' ||
        error.message === 'One or more menu items not found' ||
        error.message === 'One or more menu items unavailable'
      ) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
    }
    next(error);
  }
};

export const updateOrderStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }

    if (!canUpdateStatus(req.user?.role, req.body?.status)) {
      res.status(403).json({ success: false, message: 'Forbidden for this role' });
      return;
    }

    const order = await updateOrderStatus(id, req.body);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid status transition') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const processPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const result = await processPayment(id, req.body);
    res.status(200).json({ success: true, message: 'Payment successful', data: result });
  } catch (error) {
    if (error instanceof Error && error.message === 'Order not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const confirmManualPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const payment = await confirmManualPayment(id, req.body);
    res.status(200).json({ success: true, message: 'Payment status updated', data: payment });
  } catch (error) {
    if (error instanceof Error && error.message === 'Order not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const getAllHandler = async (
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

export const getByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const order = await findOrderById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order fetched', data: order });
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
    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const order = await updateOrder(id, req.body);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order updated', data: order });
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
    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const deleted = await deleteOrder(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order deleted' });
  } catch (error) {
    next(error);
  }
};
