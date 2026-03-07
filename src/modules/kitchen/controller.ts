import { Request, Response, NextFunction } from 'express';
import { getActiveOrders, updateKitchenOrderStatus } from './service';
import { ActiveOrdersQuery } from './types';
import { parseIdParam } from '../_shared/validation';

const canUpdateStatus = (role: string | undefined, status: string): boolean => {
  if (!role) return false;
  if (role === 'Admin' || role === 'Super Admin') return true;
  if (role === 'Chef') return status === 'Preparing' || status === 'Ready';
  if (role === 'Waiter') return status === 'Delivered';
  return false;
};

export const getActiveOrdersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tableId = req.query.tableId ? String(req.query.tableId) : undefined;
    const query: ActiveOrdersQuery = tableId ? { tableId } : {};

    const orders = await getActiveOrders(query);
    res.status(200).json({ success: true, message: 'Active orders fetched', data: orders });
  } catch (error) {
    next(error);
  }
};

export const updateStatusHandler = async (
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

    const order = await updateKitchenOrderStatus(id, req.body);
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
