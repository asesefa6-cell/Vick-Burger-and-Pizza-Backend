import { Request, Response, NextFunction } from 'express';
import {
  createPayment,
  findAllPayments,
  findPaymentById,
  updatePayment,
  deletePayment,
} from './service';
import { parseIdParam } from '../_shared/validation';

export const createHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payment = await createPayment(req.body);
    res.status(201).json({ success: true, message: 'Payment created', data: payment });
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
    const payments = await findAllPayments();
    res.status(200).json({ success: true, message: 'Payments fetched', data: payments });
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
    const payment = await findPaymentById(id);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Payment fetched', data: payment });
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
    const payment = await updatePayment(id, req.body);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Payment updated', data: payment });
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
    const deleted = await deletePayment(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    next(error);
  }
};
