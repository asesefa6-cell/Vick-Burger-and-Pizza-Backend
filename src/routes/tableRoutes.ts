import { Router } from 'express';
import {
  createTableHandler,
  getAllTablesHandler,
  getTableByIdHandler,
  updateTableHandler,
  deleteTableHandler,
} from '../controllers/tableController';

// Example usage: app.use('/api/tables', tableRoutes);

const router = Router();

router.post('/', createTableHandler);
router.get('/', getAllTablesHandler);
router.get('/:id', getTableByIdHandler);
router.put('/:id', updateTableHandler);
router.delete('/:id', deleteTableHandler);

export default router;
