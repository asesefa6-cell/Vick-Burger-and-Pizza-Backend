import { Request, Response, NextFunction } from 'express';
import { createFile } from './fileService';

export const uploadFileHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const file = await createFile(req.file);
    res.status(201).json({ success: true, message: 'File uploaded', data: file });
  } catch (error) {
    next(error);
  }
};
