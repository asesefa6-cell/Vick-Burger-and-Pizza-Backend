import { models } from '../db';
import { MenuItem, MenuItemCreationAttributes, MenuItemAttributes } from '../models/MenuItem';

// Example usage:
// const item = await createMenuItem({ itemName: 'Classic Burger', price: '9.99', availabilityStatus: true, categoryId: 1, businessId: 1 });

export const createMenuItem = async (
  payload: MenuItemCreationAttributes
): Promise<MenuItem> => {
  return await models.MenuItem.create(payload);
};

export const findAllMenuItems = async (): Promise<MenuItem[]> => {
  return await models.MenuItem.findAll();
};

export const findMenuItemById = async (id: number): Promise<MenuItem | null> => {
  return await models.MenuItem.findByPk(id);
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
