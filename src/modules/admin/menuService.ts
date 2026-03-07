import { models } from '../../db';
import { MenuItem, MenuItemAttributes, MenuItemCreationAttributes } from '../menuItem/model';

export const createMenuItem = async (payload: MenuItemCreationAttributes): Promise<MenuItem> => {
  return await models.MenuItem.create(payload);
};

export const updateMenuItem = async (
  id: number,
  updates: Partial<MenuItemAttributes>
): Promise<MenuItem | null> => {
  const item = await models.MenuItem.findByPk(id);
  if (!item) return null;
  return await item.update(updates);
};

export const deleteMenuItem = async (id: number): Promise<boolean> => {
  const deletedCount = await models.MenuItem.destroy({ where: { id } });
  return deletedCount > 0;
};

export const findMenuItemsByBusiness = async (businessId: number): Promise<MenuItem[]> => {
  return await models.MenuItem.findAll({ where: { businessId } });
};
