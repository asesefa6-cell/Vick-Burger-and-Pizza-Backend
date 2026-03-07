import { Request, Response, NextFunction } from 'express';
import {
  createTable,
  findAllTables,
  findTableById,
  updateTable,
  deleteTable,
} from './service';
import { parseIdParam } from '../_shared/validation';

export const createHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const table = await createTable(req.body);
    res.status(201).json({ success: true, message: 'Table created', data: table });
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
    const tables = await findAllTables();
    res.status(200).json({ success: true, message: 'Tables fetched', data: tables });
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
    const table = await findTableById(id);
    if (!table) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Table fetched', data: table });
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
    const table = await updateTable(id, req.body);
    if (!table) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Table updated', data: table });
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
    const deleted = await deleteTable(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Table deleted' });
  } catch (error) {
    next(error);
  }
};
