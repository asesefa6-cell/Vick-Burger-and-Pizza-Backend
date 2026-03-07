import { Request, Response, NextFunction } from 'express';
import { createStaffUser, deleteStaffUser, listStaffUsers, updateStaffUser } from './staffService';
import { parseIdParam } from '../../_shared/validation';

export const listStaffHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business not assigned' });
      return;
    }
    const users = await listStaffUsers(businessId, { excludeManager: req.user?.role === 'Manager' });
    res.status(200).json({ success: true, message: 'Staff fetched', data: users });
  } catch (error) {
    next(error);
  }
};

export const createStaffHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business not assigned' });
      return;
    }
    const user = await createStaffUser({ ...req.body, businessId, actorRole: req.user?.role });
    res.status(201).json({ success: true, message: 'Staff created', data: user });
  } catch (error) {
    next(error);
  }
};

export const updateStaffHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    const user = await updateStaffUser(id, businessId, req.body, req.user?.role);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Staff updated', data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteStaffHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    const deleted = await deleteStaffUser(id, businessId, req.user?.role);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Staff deleted' });
  } catch (error) {
    next(error);
  }
};
