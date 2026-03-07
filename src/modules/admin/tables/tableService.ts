import { models } from '../../../db';
import { Table } from '../../table/model';

const makeQr = (businessId: string, tableNumber: string) => `QR-${businessId}-${tableNumber}-${Date.now()}`;

export const listTablesByBusiness = async (businessId: string): Promise<Table[]> => {
  return await models.Table.findAll({ where: { businessId }, order: [['createdAt', 'DESC']] });
};

export const createTable = async (payload: { tableNumber: string; businessId: string; isActive?: boolean; isAvailable?: boolean }): Promise<Table> => {
  return await models.Table.create({
    tableNumber: payload.tableNumber,
    businessId: payload.businessId,
    isActive: payload.isActive ?? true,
    isAvailable: payload.isAvailable ?? true,
    status: 'waiting',
    qrCode: makeQr(payload.businessId, payload.tableNumber),
  });
};

export const createTablesBulk = async (businessId: string, count: number, prefix = 'Table'): Promise<Table[]> => {
  const rows = Array.from({ length: count }).map((_, i) => {
    const tableNumber = `${prefix}-${i + 1}`;
    return {
      tableNumber,
      businessId,
      isActive: true,
      isAvailable: true,
      status: 'waiting',
      qrCode: makeQr(businessId, tableNumber),
    };
  });
  return await models.Table.bulkCreate(rows);
};

export const updateTable = async (id: string, businessId: string, updates: { tableNumber?: string; isActive?: boolean; isAvailable?: boolean }): Promise<Table | null> => {
  const table = await models.Table.findOne({ where: { id, businessId } });
  if (!table) return null;
  return await table.update(updates);
};

export const deleteTable = async (id: string, businessId: string): Promise<boolean> => {
  const deletedCount = await models.Table.destroy({ where: { id, businessId } });
  return deletedCount > 0;
};
