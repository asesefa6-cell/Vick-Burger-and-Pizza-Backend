import { models } from '../../db';
import { File } from '../../models/File';

export const createFile = async (file: Express.Multer.File): Promise<File> => {
  return await models.File.create({
    originalName: file.originalname,
    filename: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: `/uploads/${file.filename}`,
    url: `/uploads/${file.filename}`,
  });
};
