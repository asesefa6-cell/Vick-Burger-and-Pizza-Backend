import { Request, Response, NextFunction } from 'express';
import { createBusiness, updateBusiness, deleteBusiness, listBusinesses } from './businessService';
import { parseIdParam } from '../_shared/validation';

export const createBusinessHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const business = await createBusiness(req.body);
    res.status(201).json({ success: true, message: 'Business created', data: business });
  } catch (error) {
    next(error);
  }
};

export const getBusinessesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businesses = await listBusinesses((req as any).validatedQuery || req.query);
    res.status(200).json({ success: true, message: 'Businesses fetched', data: businesses });
  } catch (error) {
    next(error);
  }
};

export const updateBusinessHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (id === null) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const business = await updateBusiness(id, req.body);
    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Business updated', data: business });
  } catch (error) {
    next(error);
  }
};

export const deleteBusinessHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (id === null) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const deleted = await deleteBusiness(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Business deleted' });
  } catch (error) {
    next(error);
  }
};
