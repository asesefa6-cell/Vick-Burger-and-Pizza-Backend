import { Transaction } from 'sequelize';
import { sequelize, models } from '../../db';
import { Order, OrderAttributes } from './model';
import { Payment } from '../../models/Payment';
import {
  PlaceOrderInput,
  UpdateOrderStatusInput,
  PaymentInput,
  OrderStatus,
  Receipt,
} from './types';
import { getSocket } from '../../realtime/socket';
import { setTableStatus } from '../_shared/tableStatus';

const VALID_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  Pending: ['Preparing'],
  Preparing: ['Ready'],
  Ready: ['Delivered'],
  Delivered: [],
};

const calculateTotal = (items: { price: string; quantity: number }[]): string => {
  const total = items.reduce((sum, item) => {
    return sum + Number(item.price) * item.quantity;
  }, 0);
  return total.toFixed(2);
};

export const placeOrder = async (input: PlaceOrderInput): Promise<Order> => {
  const result = await sequelize.transaction(async (transaction: Transaction) => {
    const table = await models.Table.findByPk(input.tableId, { transaction });
    if (!table) {
      throw new Error('Invalid table');
    }

    if (!input.items || input.items.length === 0) {
      throw new Error('No items in order');
    }

    const menuItems = await models.MenuItem.findAll({
      where: { id: input.items.map((i) => i.itemId) },
      transaction,
    });

    if (menuItems.length !== input.items.length) {
      throw new Error('One or more menu items not found');
    }

    const unavailable = menuItems.find((m) => !m.availabilityStatus);
    if (unavailable) {
      throw new Error('One or more menu items unavailable');
    }

    const totalAmount = calculateTotal(
      input.items.map((i) => ({
        price: menuItems.find((m) => m.id === i.itemId)?.price || '0',
        quantity: i.quantity,
      }))
    );

    const order = await models.Order.create(
      {
        tableId: input.tableId,
        status: 'Pending',
        totalAmount,
        paymentMethod: input.paymentMethod ?? null,
        pendingAt: new Date(),
      },
      { transaction }
    );

    await table.update({ isAvailable: false }, { transaction });

    const orderItemsPayload = input.items.map((i) => ({
      orderId: order.id,
      itemId: i.itemId,
      quantity: i.quantity,
      specialInstruction: i.specialInstruction || null,
    }));

    await models.OrderItem.bulkCreate(orderItemsPayload, { transaction });

    return { order, businessId: table.businessId };
  });

  try {
    const io = getSocket();
    io.to(`kitchen:${result.businessId}`).emit('OrderPlaced', {
      orderId: result.order.id,
      tableId: result.order.tableId,
      businessId: result.businessId,
      totalAmount: result.order.totalAmount,
      status: result.order.status,
      pendingAt: result.order.pendingAt?.toISOString(),
    });
  } catch {
    // Socket not initialized; ignore for now.
  }

  await setTableStatus(result.order.tableId, 'ordered');
  await setTableStatus(result.order.tableId, 'unpaid');

  return result.order;
};

const statusTimestampPatch = (status: OrderStatus): Partial<OrderAttributes> => {
  const now = new Date();
  if (status === 'Pending') return { pendingAt: now };
  if (status === 'Preparing') return { preparingAt: now };
  if (status === 'Ready') return { readyAt: now };
  if (status === 'Delivered') return { deliveredAt: now };
  return {};
};

export const updateOrderStatus = async (
  orderId: string,
  input: UpdateOrderStatusInput,
  options?: { force?: boolean }
): Promise<Order | null> => {
  const order = await models.Order.findByPk(orderId, { include: [{ model: models.Table, as: 'table' }, { model: models.Payment }] });
  if (!order) return null;

  if (!options?.force) {
    const allowedNext = VALID_STATUS_FLOW[order.status as OrderStatus] || [];
    if (!allowedNext.includes(input.status)) {
      throw new Error('Invalid status transition');
    }
  }

  const updated = await order.update({
    status: input.status,
    ...statusTimestampPatch(input.status),
  });

  try {
    const io = getSocket();
    const businessId = order.table?.businessId || '';
    io.to(`staff:${businessId}`).emit('OrderStatusUpdated', {
      orderId: updated.id,
      tableId: updated.tableId,
      businessId,
      status: updated.status,
      preparingAt: updated.preparingAt?.toISOString() ?? null,
      readyAt: updated.readyAt?.toISOString() ?? null,
      deliveredAt: updated.deliveredAt?.toISOString() ?? null,
    });
    io.to(`table:${updated.tableId}`).emit('OrderStatusUpdated', {
      orderId: updated.id,
      tableId: updated.tableId,
      businessId,
      status: updated.status,
      preparingAt: updated.preparingAt?.toISOString() ?? null,
      readyAt: updated.readyAt?.toISOString() ?? null,
      deliveredAt: updated.deliveredAt?.toISOString() ?? null,
    });
  } catch {
    // Socket not initialized; ignore for now.
  }

  if (updated.status === 'Delivered') {
    const paid = order.payment?.paymentStatus?.toLowerCase() === 'paid';
    await setTableStatus(updated.tableId, paid ? 'enjoying' : 'unpaid');
  }

  return updated;
};

export const findAllOrders = async (): Promise<Order[]> => {
  return await models.Order.findAll();
};

export const findOrderById = async (id: string): Promise<Order | null> => {
  return await models.Order.findByPk(id);
};

export const updateOrder = async (
  id: string,
  updates: Partial<OrderAttributes>
): Promise<Order | null> => {
  const order = await models.Order.findByPk(id);
  if (!order) return null;
  return await order.update(updates);
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  const deletedCount = await models.Order.destroy({ where: { id } });
  return deletedCount > 0;
};

export const processPayment = async (
  orderId: string,
  input: PaymentInput
): Promise<{ payment: Payment; receipt: Receipt }> => {
  const order = await models.Order.findByPk(orderId, { include: [{ model: models.Table, as: 'table' }] });
  if (!order) {
    throw new Error('Order not found');
  }

  const payment = await models.Payment.create({
    orderId: order.id,
    paymentMethod: input.paymentMethod,
    paymentStatus: 'Paid',
    transactionReference: input.transactionReference || null,
    paymentDate: new Date(),
  });

  const receipt: Receipt = {
    receiptId: `rcpt_${payment.id}_${Date.now()}`,
    orderId: order.id,
    paymentId: payment.id,
    amount: order.totalAmount,
    paymentDate: new Date().toISOString(),
    provider: input.provider,
  };

  try {
    const io = getSocket();
    const businessId = order.table?.businessId || '';
    io.to(`admin:${businessId}`).emit('PaymentCompleted', {
      orderId: order.id,
      tableId: order.tableId,
      businessId,
      amount: order.totalAmount,
      paymentId: payment.id,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate?.toISOString() || new Date().toISOString(),
    });
    io.to('admin:global').emit('PaymentCompleted', {
      orderId: order.id,
      tableId: order.tableId,
      businessId,
      amount: order.totalAmount,
      paymentId: payment.id,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate?.toISOString() || new Date().toISOString(),
    });
  } catch {
    // Socket not initialized; ignore for now.
  }

  if (order.status === 'Delivered') {
    await setTableStatus(order.tableId, 'enjoying');
  } else {
    await setTableStatus(order.tableId, 'paid');
  }

  return { payment, receipt };
};

export const confirmManualPayment = async (
  orderId: string,
  input: { paymentMethod?: string; status: 'Paid' | 'Unpaid' }
) => {
  const order = await models.Order.findByPk(orderId, { include: [{ model: models.Table, as: 'table' }] });
  if (!order) {
    throw new Error('Order not found');
  }

  const payment = await models.Payment.create({
    orderId: order.id,
    paymentMethod: input.paymentMethod || order.paymentMethod || 'Cash',
    paymentStatus: input.status,
    transactionReference: null,
    paymentDate: input.status === 'Paid' ? new Date() : null,
  });

  if (order.table) {
    await setTableStatus(order.tableId, input.status === 'Paid' ? (order.status === 'Delivered' ? 'enjoying' : 'paid') : 'unpaid');
    try {
      const io = getSocket();
      if (input.status === 'Paid') {
        io.to(`admin:${order.table.businessId}`).emit('PaymentCompleted', {
          orderId: order.id,
          tableId: order.tableId,
          businessId: order.table.businessId,
          amount: order.totalAmount,
          paymentId: payment.id,
          paymentMethod: payment.paymentMethod,
          paymentDate: payment.paymentDate?.toISOString() || new Date().toISOString(),
        });
      }
      io.to(`staff:${order.table.businessId}`).emit('TableStatusUpdated', {
        tableId: order.tableId,
        businessId: order.table.businessId,
        status: input.status === 'Paid' ? (order.status === 'Delivered' ? 'enjoying' : 'paid') : 'unpaid',
      });
    } catch {
      // ignore
    }
  }

  return payment;
};
