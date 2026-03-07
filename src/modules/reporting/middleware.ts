import { Request, Response, NextFunction } from 'express';

export const requireBusinessAccess = (req: Request, res: Response, next: NextFunction): void => {
  const userBusinessId = req.user?.businessId ?? null;
  const queryBusinessId = req.query.businessId ? String(req.query.businessId) : null;

  if (!userBusinessId) {
    res.status(403).json({ success: false, message: 'Business scope required' });
    return;
  }

  if (queryBusinessId && queryBusinessId !== userBusinessId) {
    res.status(403).json({ success: false, message: 'Forbidden for this business' });
    return;
  }

  if (!queryBusinessId) {
    req.query.businessId = String(userBusinessId);
  }

  next();
};
