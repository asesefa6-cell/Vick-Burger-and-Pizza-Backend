import { models } from '../../db';
import { MenuItem, MenuItemAttributes, MenuItemCreationAttributes } from './model';

export const createMenuItem = async (payload: MenuItemCreationAttributes): Promise<MenuItem> => {
  return await models.MenuItem.create(payload);
};

export const findAllMenuItems = async (): Promise<MenuItem[]> => {
  return await models.MenuItem.findAll();
};

export const findMenuItemById = async (id: string): Promise<MenuItem | null> => {
  return await models.MenuItem.findByPk(id);
};

export const updateMenuItem = async (
  id: string,
  updates: Partial<MenuItemAttributes>
): Promise<MenuItem | null> => {
  const item = await models.MenuItem.findByPk(id);
  if (!item) return null;
  return await item.update(updates);
};

export const deleteMenuItem = async (id: string): Promise<boolean> => {
  const deletedCount = await models.MenuItem.destroy({ where: { id } });
  return deletedCount > 0;
};
