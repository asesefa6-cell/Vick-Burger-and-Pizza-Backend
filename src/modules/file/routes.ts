import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../../middlewares/authMiddleware';
import { authorize } from '../../middlewares/roleMiddleware';
import { uploadFileHandler } from './fileController';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.post('/', authenticate, authorize(['Super Admin', 'Admin', 'Manager', 'Chef', 'Waiter']), upload.single('file'), uploadFileHandler);

export default router;
