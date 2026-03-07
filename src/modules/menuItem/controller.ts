import { Request, Response, NextFunction } from 'express';
import {
  createMenuItem,
  findAllMenuItems,
  findMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from './service';
import { parseIdParam } from '../_shared/validation';

export const createHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const item = await createMenuItem(req.body);
    res.status(201).json({ success: true, message: 'Menu item created', data: item });
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
    const items = await findAllMenuItems();
    res.status(200).json({ success: true, message: 'Menu items fetched', data: items });
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
    const item = await findMenuItemById(id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Menu item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Menu item fetched', data: item });
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
