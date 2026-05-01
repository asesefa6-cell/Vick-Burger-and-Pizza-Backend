import { models } from '../../db';
import { setTableStatus } from '../_shared/tableStatus';
import { Op } from 'sequelize';

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
      const orders = await models.Order.findAll({
        where: { tableId: table.id, status: { [Op.in]: ['Pending', 'Preparing', 'Ready'] } },
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
      const combinedOrderItems = orders.flatMap((o: any) => o.orderItems ?? []);
      const orderWithCombinedItems = order
        ? {
            ...order.toJSON(),
            orderItems: combinedOrderItems,
          }
        : null;

      return {
        assignment,
        table,
        order: orderWithCombinedItems,
        orders,
        paymentStatus,
        paid,
      };
    })
  );

  return results;
};

export const getWaiterAnalytics = async (
  waiterId: string,
  filter: 'today' | 'all_time' = 'today',
  page = 1,
  limit = 10
) => {
  const assignments = await models.TableAssignment.findAll({ where: { waiterId } });
  const tableIds = assignments.map((a) => a.tableId);
  if (tableIds.length === 0) {
    return { deliveredOrders: 0, deliveredAmount: 0, deliveredItems: [] };
  }
  const where: Record<string, unknown> = { tableId: { [Op.in]: tableIds }, status: 'Delivered' };
  if (filter === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    where.createdAt = { [Op.gte]: start };
  }
  const deliveredOrders = await models.Order.findAll({
    where,
    include: [
      { model: models.Payment, required: true, where: { paymentStatus: 'Paid' } },
      {
        model: models.OrderItem,
        as: 'orderItems',
        include: [{ model: models.MenuItem, as: 'menuItem' }],
      },
    ],
    attributes: ['id', 'totalAmount', 'tableId', 'createdAt'],
    order: [['createdAt', 'DESC']],
  });
  const deliveredAmount = deliveredOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const deliveredTableIds = Array.from(new Set(deliveredOrders.map((o) => o.tableId)));
  const tables = await models.Table.findAll({ where: { id: { [Op.in]: deliveredTableIds } }, attributes: ['id', 'tableNumber'] });
  const tableMap = new Map(tables.map((t) => [t.id, t.tableNumber]));
  const allDeliveredItems = deliveredOrders.map((order: any) => ({
    orderId: order.id,
    tableId: order.tableId,
    tableNumber: tableMap.get(order.tableId) || '—',
    totalAmount: Number(order.totalAmount || 0),
    deliveredAt: order.createdAt,
    foods: (order.orderItems || []).map((oi: any) => ({
      itemName: oi.menuItem?.itemName || 'Item',
      quantity: oi.quantity,
    })),
  }));
  const total = allDeliveredItems.length;
  const startIndex = (page - 1) * limit;
  const paged = allDeliveredItems.slice(startIndex, startIndex + limit);
  return { deliveredOrders: deliveredOrders.length, deliveredAmount, deliveredItems: paged, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
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
  const normalizedStatus = String(table.status || '').toLowerCase();
  if (normalizedStatus !== 'enjoying' && normalizedStatus !== 'paid') {
    throw new Error('Table not ready to complete');
  }

  await table.update({ isAvailable: true, status: 'waiting' });
  await setTableStatus(tableId, 'waiting');

  return { success: true };
};
