import { Request, Response, NextFunction } from 'express';
import {
  createCategory,
  findAllCategories,
  findCategoryById,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';

// Example route usage:
// router.post('/categories', createCategoryHandler);

export const createCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    next(error);
  }
};

export const getAllCategoriesHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await findAllCategories();
    res.status(200).json({ success: true, message: 'Categories fetched', data: categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await findCategoryById(Number(req.params.id));
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Category fetched', data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await updateCategory(Number(req.params.id), req.body);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Category updated', data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await deleteCategory(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
