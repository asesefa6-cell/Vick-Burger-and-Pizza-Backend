import { Request, Response, NextFunction } from 'express';
import {
  createPayment,
  findAllPayments,
  findPaymentById,
  updatePayment,
  deletePayment,
} from '../services/paymentService';

// Example route usage:
// router.post('/payments', createPaymentHandler);

export const createPaymentHandler = async (
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

export const getAllPaymentsHandler = async (
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

export const getPaymentByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payment = await findPaymentById(Number(req.params.id));
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Payment fetched', data: payment });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payment = await updatePayment(Number(req.params.id), req.body);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Payment updated', data: payment });
  } catch (error) {
    next(error);
  }
};

export const deletePaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await deletePayment(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    next(error);
  }
};
