import { models } from '../../db';
import { getSocket } from '../../realtime/socket';

export type TableStatus = 'waiting' | 'ordered' | 'unpaid' | 'paid' | 'enjoying';

export const setTableStatus = async (
  tableId: string,
  status: TableStatus
): Promise<void> => {
  const table = await models.Table.findByPk(tableId);
  if (!table) return;

  if (table.status === status) return;
  await table.update({ status });

  try {
    const io = getSocket();
    const businessId = table.businessId;
    io.to(`staff:${businessId}`).emit('TableStatusUpdated', {
      tableId: table.id,
      businessId,
      status,
    });
    io.to(`admin:${businessId}`).emit('TableStatusUpdated', {
      tableId: table.id,
      businessId,
      status,
    });
  } catch {
    // Socket not initialized
  }
};
