import { Request, Response, NextFunction } from 'express';
import {
  createRole,
  findAllRoles,
  findRoleById,
  updateRole,
  deleteRole,
} from './service';
import { parseIdParam } from '../_shared/validation';

export const createHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = await createRole(req.body);
    res.status(201).json({ success: true, message: 'Role created', data: role });
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
    const roles = await findAllRoles();
    res.status(200).json({ success: true, message: 'Roles fetched', data: roles });
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
    const role = await findRoleById(id);
    if (!role) {
      res.status(404).json({ success: false, message: 'Role not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Role fetched', data: role });
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
    const role = await updateRole(id, req.body);
    if (!role) {
      res.status(404).json({ success: false, message: 'Role not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Role updated', data: role });
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
    const deleted = await deleteRole(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Role not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Role deleted' });
  } catch (error) {
    next(error);
  }
};
