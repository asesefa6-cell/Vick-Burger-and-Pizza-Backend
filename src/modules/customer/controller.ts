import { Request, Response, NextFunction } from 'express';
import {
  getTableByQrCode,
  getMenuForTable,
  placeCustomerOrder,
  processCustomerPayment,
  getPaymentMethodsForTable,
  initChapaPayment,
  verifyChapaPayment,
  submitCustomerRating,
} from './service';
import { parseIdParam } from '../_shared/validation';

export const getTableByQrHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
    if (!code) {
      res.status(400).json({ success: false, message: 'Invalid QR code' });
      return;
    }
    const table = await getTableByQrCode(code);
    if (!table) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }
    if (!table.isActive || !table.isAvailable) {
      res.status(400).json({ success: false, message: 'Table not active' });
      return;
    }
    res.status(200).json({ success: true, message: 'Table found', data: table });
  } catch (error) {
    next(error);
  }
};

export const getMenuForTableHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tableId = Array.isArray(req.params.tableId) ? req.params.tableId[0] : req.params.tableId;
    if (!tableId) {
      res.status(400).json({ success: false, message: 'Invalid table id' });
      return;
    }

    const menu = await getMenuForTable(tableId);
    if (!menu) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Menu fetched', data: menu });
  } catch (error) {
    if (error instanceof Error && error.message === 'Table not active') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const placeCustomerOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await placeCustomerOrder(req.body);
    res.status(201).json({ success: true, message: 'Order placed', data: order });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === 'Invalid table' ||
        error.message === 'Table not active' ||
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

export const processCustomerPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = parseIdParam(req);
    if (orderId === null) {
      res.status(400).json({ success: false, message: 'Invalid order id' });
      return;
    }
    const result = await processCustomerPayment(orderId, req.body);
    res.status(200).json({ success: true, message: 'Payment successful', data: result });
  } catch (error) {
    if (error instanceof Error && error.message === 'Order not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const getPaymentMethodsForTableHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tableId = Array.isArray(req.params.tableId) ? req.params.tableId[0] : req.params.tableId;
    if (!tableId) {
      res.status(400).json({ success: false, message: 'Invalid table id' });
      return;
    }
    const methods = await getPaymentMethodsForTable(tableId);
    res.status(200).json({ success: true, message: 'Payment methods fetched', data: methods });
  } catch (error) {
    next(error);
  }
};

export const initChapaPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = parseIdParam(req);
    if (!orderId) {
      res.status(400).json({ success: false, message: 'Invalid order id' });
      return;
    }
    const { returnUrl } = req.body as { returnUrl?: string };
    const result = await initChapaPayment(orderId, returnUrl);
    res.status(200).json({ success: true, message: 'Chapa payment initialized', data: result });
  } catch (error) {
    if (error instanceof Error && error.message === 'Chapa not configured') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    if (error instanceof Error && error.message === 'Order not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const verifyChapaPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = parseIdParam(req);
    if (!orderId) {
      res.status(400).json({ success: false, message: 'Invalid order id' });
      return;
    }
    const txRefParam = req.query.tx_ref;
    const txRefValue = Array.isArray(txRefParam) ? txRefParam[0] : txRefParam;
    const txRef = typeof txRefValue === 'string' ? txRefValue : undefined;
    if (!txRef) {
      res.status(400).json({ success: false, message: 'Invalid tx_ref' });
      return;
    }
    const result = await verifyChapaPayment(orderId, txRef);
    res.status(200).json({ success: true, message: 'Chapa payment verified', data: result });
  } catch (error) {
    if (error instanceof Error && error.message === 'Chapa not configured') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    if (error instanceof Error && error.message === 'Order not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const submitCustomerRatingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tableId = Array.isArray(req.params.tableId) ? req.params.tableId[0] : req.params.tableId;
    if (!tableId) {
      res.status(400).json({ success: false, message: 'Invalid table id' });
      return;
    }
    const { rating } = req.body as { rating: number };
    await submitCustomerRating(tableId, rating);
    res.status(200).json({ success: true, message: 'Rating submitted' });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Invalid table' || error.message === 'No waiter assigned')) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
