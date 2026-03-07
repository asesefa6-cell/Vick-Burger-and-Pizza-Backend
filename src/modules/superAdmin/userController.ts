import { Request, Response, NextFunction } from 'express';
import { createUser, deleteUser, listUsers, assignBusinessesToUser, updateUser } from './userService';
import { parseIdParam } from '../_shared/validation';

export const createUserHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, message: 'User created', data: user });
  } catch (error) {
    next(error);
  }
};

export const listUsersHandler = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await listUsers();
    res.status(200).json({ success: true, message: 'Users fetched', data: users });
  } catch (error) {
    next(error);
  }
};

export const updateUserHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (id === null) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const user = await updateUser(id, req.body);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUserHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (id === null) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const deleted = await deleteUser(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

export const assignBusinessesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (id === null) {
      res.status(400).json({ success: false, message: 'Invalid id' });
      return;
    }
    const businessIds = req.body.businessIds as string[];
    await assignBusinessesToUser(id, businessIds);
    res.status(200).json({ success: true, message: 'Businesses assigned' });
  } catch (error) {
    next(error);
  }
};
