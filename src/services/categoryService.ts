import { models } from '../db';
import { Category, CategoryCreationAttributes, CategoryAttributes } from '../models/Category';

// Example usage:
// const category = await createCategory({ categoryName: 'Burgers', businessId: 1 });

export const createCategory = async (
  payload: CategoryCreationAttributes
): Promise<Category> => {
  return await models.Category.create(payload);
};

export const findAllCategories = async (): Promise<Category[]> => {
  return await models.Category.findAll();
};

export const findCategoryById = async (id: number): Promise<Category | null> => {
  return await models.Category.findByPk(id);
};

export const updateCategory = async (
  id: number,
  updates: Partial<CategoryAttributes>
): Promise<Category | null> => {
  const category = await models.Category.findByPk(id);
  if (!category) return null;
  return await category.update(updates);
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  const deletedCount = await models.Category.destroy({ where: { id } });
  return deletedCount > 0;
};
