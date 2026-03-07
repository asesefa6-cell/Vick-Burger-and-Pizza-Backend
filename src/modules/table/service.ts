import { models } from '../../db';
import { Table, TableAttributes, TableCreationAttributes } from './model';

export const createTable = async (payload: TableCreationAttributes): Promise<Table> => {
  return await models.Table.create(payload);
};

export const findAllTables = async (): Promise<Table[]> => {
  return await models.Table.findAll();
};

export const findTableById = async (id: string): Promise<Table | null> => {
  return await models.Table.findByPk(id);
};

export const updateTable = async (
  id: string,
  updates: Partial<TableAttributes>
): Promise<Table | null> => {
  const table = await models.Table.findByPk(id);
  if (!table) return null;
  return await table.update(updates);
};

export const deleteTable = async (id: string): Promise<boolean> => {
  const deletedCount = await models.Table.destroy({ where: { id } });
  return deletedCount > 0;
};
