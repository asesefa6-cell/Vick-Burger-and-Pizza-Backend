import { Request, Response, NextFunction } from 'express';
import { loginUser, registerUser, getMe, updateMe } from '../services/authService';

// Example route usage:
// router.post('/auth/register', registerHandler);

export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ success: true, message: 'User registered', data: user });
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already in use') {
      res.status(409).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({ success: true, message: 'Login successful', data: result });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid email or password') {
      res.status(401).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const meHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = req.user;
    if (!payload?.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await getMe(payload.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Profile fetched', data: user });
  } catch (error) {
    next(error);
  }
};

export const updateMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = req.user;
    if (!payload?.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await updateMe(payload.userId, req.body);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    next(error);
  }
};
