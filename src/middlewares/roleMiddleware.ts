import { Request, Response, NextFunction } from 'express';
import { RoleName } from '../types/auth';

export const authorize = (allowedRoles: RoleName[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(role)) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    next();
  };
};
