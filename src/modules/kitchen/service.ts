import { Op } from 'sequelize';
import { models } from '../../db';
import { ActiveOrder, ActiveOrdersQuery, UpdateStatusInput } from './types';
import { updateOrderStatus } from '../order/service';

export const getActiveOrders = async (query: ActiveOrdersQuery): Promise<ActiveOrder[]> => {
  const where: Record<string, unknown> = {
    status: { [Op.in]: ['Pending', 'Preparing'] },
  };

  if (query.tableId) {
    where.tableId = query.tableId;
  }

  const orders = await models.Order.findAll({
    where,
    include: [
      {
        model: models.Table,
        as: 'table',
        attributes: ['id', 'tableNumber'],
      },
      {
        model: models.OrderItem,
        as: 'orderItems',
        attributes: ['itemId', 'quantity', 'specialInstruction'],
        include: [
          {
            model: models.MenuItem,
            as: 'menuItem',
            attributes: ['id', 'itemName', 'imageUrl', 'directToWaiter'],
          },
        ],
      },
    ],
    order: [['createdAt', 'ASC']],
  });

  return orders.map((order) => {
    const kitchenItems =
      order.orderItems?.filter((item) => !item.menuItem?.directToWaiter) || [];
    if (kitchenItems.length === 0) return null;
    return {
      orderId: order.id,
      tableId: order.tableId,
      tableNumber: order.table?.tableNumber || '',
      status: order.status as ActiveOrder['status'],
      totalAmount: order.totalAmount,
      timePlaced: order.createdAt.toISOString(),
      items:
        kitchenItems.map((item) => ({
        itemId: item.itemId,
        itemName: item.menuItem?.itemName || '',
        itemImageUrl: item.menuItem?.imageUrl || null,
        quantity: item.quantity,
        specialInstruction: item.specialInstruction ?? null,
      })) || [],
    };
  }).filter((o) => o !== null) as ActiveOrder[];
};

export const updateKitchenOrderStatus = async (
  orderId: string,
  input: UpdateStatusInput
) => {
  return await updateOrderStatus(orderId, input);
};
