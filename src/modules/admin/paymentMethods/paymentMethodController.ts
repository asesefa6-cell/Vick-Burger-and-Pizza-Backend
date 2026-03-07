import { Request, Response, NextFunction } from 'express';
import { createPaymentMethod, deletePaymentMethod, listPaymentMethods, updatePaymentMethod } from './paymentMethodService';
import { parseIdParam } from '../../_shared/validation';

export const listPaymentMethodsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business not assigned' });
      return;
    }
    const methods = await listPaymentMethods(businessId);
    res.status(200).json({ success: true, message: 'Payment methods fetched', data: methods });
  } catch (error) {
    next(error);
  }
};

export const createPaymentMethodHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business not assigned' });
      return;
    }
    const method = await createPaymentMethod(businessId, req.body);
    res.status(201).json({ success: true, message: 'Payment method created', data: method });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentMethodHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business not assigned' });
      return;
    }
    const id = parseIdParam(req);
    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const method = await updatePaymentMethod(businessId, id, req.body);
    if (!method) {
      res.status(404).json({ success: false, message: 'Payment method not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Payment method updated', data: method });
  } catch (error) {
    next(error);
  }
};

export const deletePaymentMethodHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business not assigned' });
      return;
    }
    const id = parseIdParam(req);
    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const deleted = await deletePaymentMethod(businessId, id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Payment method not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Payment method deleted' });
  } catch (error) {
    next(error);
  }
};
