import { Router } from 'express';
import {
  createRoleHandler,
  getAllRolesHandler,
  getRoleByIdHandler,
  updateRoleHandler,
  deleteRoleHandler,
} from '../controllers/roleController';

// Example usage: app.use('/api/roles', roleRoutes);

const router = Router();

router.post('/', createRoleHandler);
router.get('/', getAllRolesHandler);
router.get('/:id', getRoleByIdHandler);
router.put('/:id', updateRoleHandler);
router.delete('/:id', deleteRoleHandler);

export default router;
