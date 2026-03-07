import { models } from '../db';
import { Order, OrderCreationAttributes, OrderAttributes } from '../models/Order';

// Example usage:
// const order = await createOrder({ tableId: 1, status: 'Pending', totalAmount: '19.98' });

export const createOrder = async (
  payload: OrderCreationAttributes
): Promise<Order> => {
  return await models.Order.create(payload);
};

export const findAllOrders = async (): Promise<Order[]> => {
  return await models.Order.findAll();
};

export const findOrderById = async (id: number): Promise<Order | null> => {
  return await models.Order.findByPk(id);
};

export const updateOrder = async (
  id: number,
  updates: Partial<OrderAttributes>
): Promise<Order | null> => {
  const order = await models.Order.findByPk(id);
  if (!order) return null;
  return await order.update(updates);
};

export const deleteOrder = async (id: number): Promise<boolean> => {
  const deletedCount = await models.Order.destroy({ where: { id } });
  return deletedCount > 0;
};
