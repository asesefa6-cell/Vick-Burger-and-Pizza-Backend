import { Request, Response, NextFunction } from 'express';
import { getOrdersByTable, getOrdersByBusiness, updateStatus } from './orderService';
import { parseIdParam } from '../_shared/validation';

export const getOrdersByTableHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tableId = Array.isArray(req.params.tableId) ? req.params.tableId[0] : req.params.tableId;
    if (!tableId) {
      res.status(400).json({ success: false, message: 'Invalid table id' });
      return;
    }
    const orders = await getOrdersByTable(tableId);
    res.status(200).json({ success: true, message: 'Orders fetched', data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrdersByBusinessHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = Array.isArray(req.params.businessId) ? req.params.businessId[0] : req.params.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Invalid business id' });
      return;
    }
    const orders = await getOrdersByBusiness(businessId);
    res.status(200).json({ success: true, message: 'Orders fetched', data: orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const order = await updateStatus(id, req.body);
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
