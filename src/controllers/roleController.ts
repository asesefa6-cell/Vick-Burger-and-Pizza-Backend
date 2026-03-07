import { Request, Response, NextFunction } from 'express';
import {
  createRole,
  findAllRoles,
  findRoleById,
  updateRole,
  deleteRole,
} from '../services/roleService';

// Example route usage:
// router.post('/roles', createRoleHandler);

export const createRoleHandler = async (
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

export const getAllRolesHandler = async (
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

export const getRoleByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = await findRoleById(Number(req.params.id));
    if (!role) {
      res.status(404).json({ success: false, message: 'Role not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Role fetched', data: role });
  } catch (error) {
    next(error);
  }
};

export const updateRoleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = await updateRole(Number(req.params.id), req.body);
    if (!role) {
      res.status(404).json({ success: false, message: 'Role not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Role updated', data: role });
  } catch (error) {
    next(error);
  }
};

export const deleteRoleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await deleteRole(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Role not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Role deleted' });
  } catch (error) {
    next(error);
  }
};
