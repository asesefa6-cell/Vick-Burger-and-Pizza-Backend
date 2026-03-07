import { models } from '../db';
import { OrderItem, OrderItemCreationAttributes, OrderItemAttributes } from '../models/OrderItem';

// Example usage:
// const orderItem = await createOrderItem({ orderId: 1, itemId: 2, quantity: 1 });

export const createOrderItem = async (
  payload: OrderItemCreationAttributes
): Promise<OrderItem> => {
  return await models.OrderItem.create(payload);
};

export const findAllOrderItems = async (): Promise<OrderItem[]> => {
  return await models.OrderItem.findAll();
};

export const findOrderItemById = async (id: number): Promise<OrderItem | null> => {
  return await models.OrderItem.findByPk(id);
};

export const updateOrderItem = async (
  id: number,
  updates: Partial<OrderItemAttributes>
): Promise<OrderItem | null> => {
  const orderItem = await models.OrderItem.findByPk(id);
  if (!orderItem) return null;
  return await orderItem.update(updates);
};

export const deleteOrderItem = async (id: number): Promise<boolean> => {
  const deletedCount = await models.OrderItem.destroy({ where: { id } });
  return deletedCount > 0;
};
