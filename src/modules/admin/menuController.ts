import { Request, Response, NextFunction } from 'express';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  findMenuItemsByBusiness,
} from './menuService';
import { parseIdParam } from '../_shared/validation';

export const createMenuItemHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await createMenuItem(req.body);
    res.status(201).json({ success: true, message: 'Menu item created', data: item });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItemHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const item = await updateMenuItem(id, req.body);
    if (!item) {
      res.status(404).json({ success: false, message: 'Menu item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Menu item updated', data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItemHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const deleted = await deleteMenuItem(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Menu item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    next(error);
  }
};

export const getMenuItemsByBusinessHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = req.params.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Invalid business id' });
      return;
    }
    const items = await findMenuItemsByBusiness(businessId);
    res.status(200).json({ success: true, message: 'Menu items fetched', data: items });
  } catch (error) {
    next(error);
  }
};
