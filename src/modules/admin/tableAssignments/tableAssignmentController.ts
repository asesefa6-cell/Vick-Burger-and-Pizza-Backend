import { Request, Response, NextFunction } from 'express';
import { assignTableToWaiter, listAssignments, unassignTable } from './tableAssignmentService';

export const listAssignmentsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business not assigned' });
      return;
    }
    const rows = await listAssignments(businessId);
    res.status(200).json({ success: true, message: 'Assignments fetched', data: rows });
  } catch (error) {
    next(error);
  }
};

export const assignTableHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business not assigned' });
      return;
    }
    const { tableId, waiterId } = req.body as { tableId: string; waiterId: string };
    const row = await assignTableToWaiter(businessId, tableId, waiterId, req.user?.userId);
    res.status(200).json({ success: true, message: 'Table assigned', data: row });
  } catch (error) {
    next(error);
  }
};

export const unassignTableHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business not assigned' });
      return;
    }
    const tableId = req.params.tableId;
    if (!tableId) {
      res.status(400).json({ success: false, message: 'Invalid table id' });
      return;
    }
    const deleted = await unassignTable(businessId, tableId);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Assignment removed' });
  } catch (error) {
    next(error);
  }
};
