import { models } from '../../db';
import { OrderItem, OrderItemAttributes, OrderItemCreationAttributes } from './model';

export const createOrderItem = async (payload: OrderItemCreationAttributes): Promise<OrderItem> => {
  return await models.OrderItem.create(payload);
};

export const findAllOrderItems = async (): Promise<OrderItem[]> => {
  return await models.OrderItem.findAll();
};

export const findOrderItemById = async (id: string): Promise<OrderItem | null> => {
  return await models.OrderItem.findByPk(id);
};

export const updateOrderItem = async (
  id: string,
  updates: Partial<OrderItemAttributes>
): Promise<OrderItem | null> => {
  const orderItem = await models.OrderItem.findByPk(id);
  if (!orderItem) return null;
  return await orderItem.update(updates);
};

export const deleteOrderItem = async (id: string): Promise<boolean> => {
  const deletedCount = await models.OrderItem.destroy({ where: { id } });
  return deletedCount > 0;
};
