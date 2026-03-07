import { Request, Response, NextFunction } from 'express';
import { createTable, createTablesBulk, listTablesByBusiness, updateTable, deleteTable } from './tableService';
import { parseIdParam } from '../../_shared/validation';

export const listTablesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business not assigned' });
      return;
    }
    const tables = await listTablesByBusiness(businessId);
    res.status(200).json({ success: true, message: 'Tables fetched', data: tables });
  } catch (error) {
    next(error);
  }
};

export const createTableHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business not assigned' });
      return;
    }
    const table = await createTable({ ...req.body, businessId });
    res.status(201).json({ success: true, message: 'Table created', data: table });
  } catch (error) {
    next(error);
  }
};

export const bulkCreateTablesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business not assigned' });
      return;
    }
    const { count, prefix } = req.body as { count: number; prefix?: string };
    const tables = await createTablesBulk(businessId, count, prefix);
    res.status(201).json({ success: true, message: 'Tables created', data: tables });
  } catch (error) {
    next(error);
  }
};

export const updateTableHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    const table = await updateTable(id, businessId, req.body);
    if (!table) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Table updated', data: table });
  } catch (error) {
    next(error);
  }
};

export const deleteTableHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    const deleted = await deleteTable(id, businessId);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Table deleted' });
  } catch (error) {
    next(error);
  }
};
