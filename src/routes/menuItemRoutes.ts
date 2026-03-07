import { Router } from 'express';
import {
  createMenuItemHandler,
  getAllMenuItemsHandler,
  getMenuItemByIdHandler,
  updateMenuItemHandler,
  deleteMenuItemHandler,
} from '../controllers/menuItemController';

// Example usage: app.use('/api/menu-items', menuItemRoutes);

const router = Router();

router.post('/', createMenuItemHandler);
router.get('/', getAllMenuItemsHandler);
router.get('/:id', getMenuItemByIdHandler);
router.put('/:id', updateMenuItemHandler);
router.delete('/:id', deleteMenuItemHandler);

export default router;
