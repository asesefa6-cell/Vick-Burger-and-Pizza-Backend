import { Request, Response, NextFunction } from 'express';
import {
  createTable,
  findAllTables,
  findTableById,
  updateTable,
  deleteTable,
} from '../services/tableService';

// Example route usage:
// router.post('/tables', createTableHandler);

export const createTableHandler = async (
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

export const getAllTablesHandler = async (
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

export const getTableByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const table = await findTableById(Number(req.params.id));
    if (!table) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Table fetched', data: table });
  } catch (error) {
    next(error);
  }
};

export const updateTableHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const table = await updateTable(Number(req.params.id), req.body);
    if (!table) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Table updated', data: table });
  } catch (error) {
    next(error);
  }
};

export const deleteTableHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await deleteTable(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Table deleted' });
  } catch (error) {
    next(error);
  }
};
