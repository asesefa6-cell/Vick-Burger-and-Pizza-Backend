import { Request, Response, NextFunction } from 'express';
import { assignRoleToUser } from './roleService';

export const assignRoleHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, roleId } = req.body as { userId: string; roleId: string };
    const user = await assignRoleToUser(userId, roleId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Role assigned', data: user });
  } catch (error) {
    next(error);
  }
};
