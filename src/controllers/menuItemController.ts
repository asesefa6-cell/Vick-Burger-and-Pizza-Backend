import { Request, Response, NextFunction } from 'express';
import {
  createMenuItem,
  findAllMenuItems,
  findMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from '../services/menuItemService';

// Example route usage:
// router.post('/menu-items', createMenuItemHandler);

export const createMenuItemHandler = async (
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

export const getAllMenuItemsHandler = async (
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

export const getMenuItemByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const item = await findMenuItemById(Number(req.params.id));
    if (!item) {
      res.status(404).json({ success: false, message: 'Menu item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Menu item fetched', data: item });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const item = await updateMenuItem(Number(req.params.id), req.body);
    if (!item) {
      res.status(404).json({ success: false, message: 'Menu item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Menu item updated', data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await deleteMenuItem(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Menu item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    next(error);
  }
};
