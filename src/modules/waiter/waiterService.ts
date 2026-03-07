import { models } from '../../db';
import { setTableStatus } from '../_shared/tableStatus';

export const getAssignedTablesForWaiter = async (waiterId: string) => {
  const assignments = await models.TableAssignment.findAll({
    where: { waiterId },
    include: [{ model: models.Table, as: 'table' }],
    order: [['createdAt', 'DESC']],
  });

  const results = await Promise.all(
    assignments.map(async (assignment) => {
      const table = assignment.table;
      if (!table) {
        return { assignment, table: null, order: null, paymentStatus: null, paid: false };
      }

      const order = await models.Order.findOne({
        where: { tableId: table.id },
        include: [
          {
            model: models.OrderItem,
            as: 'orderItems',
            include: [{ model: models.MenuItem, as: 'menuItem' }],
          },
          { model: models.Payment },
          { model: models.Table, as: 'table' },
        ],
        order: [['createdAt', 'DESC']],
      });

      const paymentStatus = order?.payment?.paymentStatus ?? null;
      const paid = table.status === 'paid' || table.status === 'enjoying' || (paymentStatus ? paymentStatus.toLowerCase() === 'paid' : false);

      return {
        assignment,
        table,
        order,
        paymentStatus,
        paid,
      };
    })
  );

  return results;
};

export const completeTableVisit = async (
  waiterId: string,
  tableId: string
) => {
  const assignment = await models.TableAssignment.findOne({ where: { waiterId, tableId }, include: [{ model: models.Table, as: 'table' }] });
  if (!assignment || !assignment.table) {
    throw new Error('Assignment not found');
  }

  const table = assignment.table;
  if (table.status !== 'enjoying') {
    throw new Error('Table not ready to complete');
  }

  await table.update({ isAvailable: true });
  await setTableStatus(tableId, 'waiting');

  return { success: true };
};
