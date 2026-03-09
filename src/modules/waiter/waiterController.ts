import { Request, Response, NextFunction } from 'express';
import { getAssignedTablesForWaiter, completeTableVisit } from './waiterService';

export const getAssignedTablesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const waiterId = req.user?.userId;
    if (!waiterId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const rows = await getAssignedTablesForWaiter(waiterId);
    res.status(200).json({ success: true, message: 'Assigned tables fetched', data: rows });
  } catch (error) {
    next(error);
  }
};

export const completeTableVisitHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const waiterId = req.user?.userId;
    if (!waiterId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const tableId = Array.isArray(req.params.tableId) ? req.params.tableId[0] : req.params.tableId;
    if (!tableId) {
      res.status(400).json({ success: false, message: 'Invalid table id' });
      return;
    }
    await completeTableVisit(waiterId, tableId);
    res.status(200).json({ success: true, message: 'Visit completed' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Assignment not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    if (error instanceof Error && error.message === 'Table not ready to complete') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
