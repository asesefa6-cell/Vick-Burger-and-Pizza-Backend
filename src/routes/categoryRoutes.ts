import { Router } from 'express';
import {
  createCategoryHandler,
  getAllCategoriesHandler,
  getCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/categoryController';

// Example usage: app.use('/api/categories', categoryRoutes);

const router = Router();

router.post('/', createCategoryHandler);
router.get('/', getAllCategoriesHandler);
router.get('/:id', getCategoryByIdHandler);
router.put('/:id', updateCategoryHandler);
router.delete('/:id', deleteCategoryHandler);

export default router;
