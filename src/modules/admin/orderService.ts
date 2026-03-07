import { models } from '../../db';
import { updateOrderStatus } from '../order/service';
import { Order } from '../order/model';

export const getOrdersByTable = async (tableId: string): Promise<Order[]> => {
  return await models.Order.findAll({
    where: { tableId },
    include: [
      {
        model: models.OrderItem,
        as: 'orderItems',
        include: [{ model: models.MenuItem, as: 'menuItem' }],
      },
      {
        model: models.Table,
        as: 'table',
        include: [{ model: models.Business, as: 'business' }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};

export const getOrdersByBusiness = async (businessId: string): Promise<Order[]> => {
  return await models.Order.findAll({
    include: [
      {
        model: models.Table,
        as: 'table',
        required: true,
        where: { businessId },
      },
      {
        model: models.OrderItem,
        as: 'orderItems',
        include: [{ model: models.MenuItem, as: 'menuItem' }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};

export const updateStatus = async (orderId: string, input: { status: 'Pending' | 'Preparing' | 'Ready' | 'Delivered' }) => {
  return await updateOrderStatus(orderId, input);
};
