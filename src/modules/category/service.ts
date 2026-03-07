import { models } from '../../db';
import { Category, CategoryAttributes, CategoryCreationAttributes } from './model';

export const createCategory = async (payload: CategoryCreationAttributes): Promise<Category> => {
  return await models.Category.create(payload);
};

export const findAllCategories = async (): Promise<Category[]> => {
  return await models.Category.findAll();
};

export const findCategoryById = async (id: string): Promise<Category | null> => {
  return await models.Category.findByPk(id);
};

export const updateCategory = async (
  id: string,
  updates: Partial<CategoryAttributes>
): Promise<Category | null> => {
  const category = await models.Category.findByPk(id);
  if (!category) return null;
  return await category.update(updates);
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  const deletedCount = await models.Category.destroy({ where: { id } });
  return deletedCount > 0;
};
