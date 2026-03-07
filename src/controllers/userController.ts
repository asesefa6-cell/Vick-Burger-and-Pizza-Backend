import { Request, Response, NextFunction } from 'express';
import {
  createUser,
  findAllUsers,
  findUserById,
  updateUser,
  deleteUser,
} from '../services/userService';

// Example route usage:
// router.post('/users', createUserHandler);

export const createUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, message: 'User created', data: user });
  } catch (error) {
    next(error);
  }
};

export const getAllUsersHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await findAllUsers();
    res.status(200).json({ success: true, message: 'Users fetched', data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await findUserById(Number(req.params.id));
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User fetched', data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await updateUser(Number(req.params.id), req.body);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await deleteUser(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};
