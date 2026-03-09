import { models } from '../../db';
import { placeOrder } from '../order/service';
import { PaymentInput, PlaceOrderInput } from '../order/types';
import { setTableStatus } from '../_shared/tableStatus';
import { getSocket } from '../../realtime/socket';

export interface CustomerTableInfo {
  tableId: string;
  tableNumber: string;
  qrCode: string;
  isActive: boolean;
  isAvailable: boolean;
  business: {
    businessId: string;
    businessName: string;
    address: string;
    phone: string;
  };
}

export interface MenuItemDto {
  itemId: string;
  itemName: string;
  description?: string | null;
  price: string;
  imageUrl?: string | null;
  availabilityStatus: boolean;
  categoryId: string;
  categoryName: string;
}

export interface MenuResponse {
  businessId: string;
  businessName: string;
  tableId: string;
  tableNumber: string;
  qrCode?: string;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    description?: string | null;
    items: MenuItemDto[];
  }>;
}

export interface PaymentMethodDto {
  id: string;
  name: string;
  type: string;
}

export const getTableByQrCode = async (qrCode: string): Promise<CustomerTableInfo | null> => {
  const table = await models.Table.findOne({
    where: { qrCode },
    include: [{ model: models.Business, as: 'business' }],
  });

  if (!table) return null;

  return {
    tableId: table.id,
    tableNumber: table.tableNumber,
    qrCode: table.qrCode,
    isActive: table.isActive,
    isAvailable: table.isAvailable,
    business: {
      businessId: table.business?.id || '',
      businessName: table.business?.businessName || '',
      address: table.business?.address || '',
      phone: table.business?.phone || '',
    },
  };
};

export const getMenuForTable = async (tableId: string): Promise<MenuResponse | null> => {
  const table = await models.Table.findByPk(tableId, {
    include: [{ model: models.Business, as: 'business' }],
  });

  if (!table) return null;

  const categories = await models.Category.findAll({
    where: { businessId: table.businessId },
    include: [
      {
        model: models.MenuItem,
        as: 'menuItems',
        where: { businessId: table.businessId },
        required: false,
      },
    ],
    order: [['categoryName', 'ASC']],
  });

  return {
    businessId: table.businessId,
    businessName: table.business?.businessName || '',
    tableId: table.id,
    tableNumber: table.tableNumber,
    qrCode: table.qrCode,
    categories: categories.map((category) => ({
      categoryId: category.id,
        categoryName: category.categoryName,
        description: category.description ?? null,
        items:
          category.menuItems?.map((item) => ({
            itemId: item.id,
            itemName: item.itemName,
            description: item.description ?? null,
            price: item.price,
            imageUrl: item.imageUrl ?? null,
            availabilityStatus: item.availabilityStatus,
            itemType: item.itemType ?? null,
            directToWaiter: item.directToWaiter,
            categoryId: category.id,
            categoryName: category.categoryName,
          })) || [],
    })),
  };
};

export const placeCustomerOrder = async (payload: PlaceOrderInput) => {
  const table = await models.Table.findByPk(payload.tableId);
  if (!table) {
    throw new Error('Invalid table');
  }
  return await placeOrder(payload);
};

export const processCustomerPayment = async (orderId: string, input: PaymentInput) => {
  return await processPayment(orderId, input);
};

export const getPaymentMethodsForTable = async (tableId: string): Promise<PaymentMethodDto[]> => {
  const table = await models.Table.findByPk(tableId);
  if (!table) return [];
  let rows = await models.PaymentMethod.findAll({
    where: { businessId: table.businessId, isActive: true },
    order: [['createdAt', 'ASC']],
  });
  if (rows.length === 0) {
    await models.PaymentMethod.create({
      businessId: table.businessId,
      name: 'Cash',
      type: 'manual',
      isActive: true,
    });
    rows = await models.PaymentMethod.findAll({
      where: { businessId: table.businessId, isActive: true },
      order: [['createdAt', 'ASC']],
    });
  }
  return rows.map((r) => ({ id: r.id, name: r.name, type: r.type }));
};

export const submitCustomerRating = async (tableId: string, rating: number) => {
  const table = await models.Table.findByPk(tableId);
  if (!table) throw new Error('Invalid table');
  const assignment = await models.TableAssignment.findOne({ where: { tableId } });
  if (!assignment) throw new Error('No waiter assigned');
  await models.TableRating.create({
    tableId,
    waiterId: assignment.waiterId,
    businessId: table.businessId,
    rating,
    visitEndedAt: new Date(),
  });
  return { success: true };
};

const getChapaMethodForOrder = async (orderId: string) => {
  const order = await models.Order.findByPk(orderId, { include: [{ model: models.Table, as: 'table' }] });
  if (!order) throw new Error('Order not found');
  const businessId = order.table?.businessId;
  if (!businessId) throw new Error('Order not found');
  const method = await models.PaymentMethod.findOne({ where: { businessId, type: 'chapa', isActive: true } });
  if (!method || !method.chapaSecretKey) throw new Error('Chapa not configured');
  return { order, method };
};

export const initChapaPayment = async (orderId: string, returnUrl?: string) => {
  const { order, method } = await getChapaMethodForOrder(orderId);
  const shortId = String(order.id).replace(/-/g, '').slice(0, 20);
  const shortTs = String(Date.now()).slice(-10);
  const txRef = `o_${shortId}_${shortTs}`.slice(0, 50);
  const payload = {
    amount: order.totalAmount,
    currency: 'ETB',
    email: 'abebech_bekele@gmail.com',
    first_name: 'Guest',
    last_name: 'User',
    phone_number: '0912345678',
    tx_ref: txRef,
    ...(returnUrl ? { return_url: returnUrl } : {}),
  };

  const res = await fetch('https://api.chapa.co/v1/transaction/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${method.chapaSecretKey}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = typeof data?.message === 'string' ? data.message : JSON.stringify(data);
    throw new Error(msg || 'Chapa init failed');
  }

  await models.Payment.create({
    orderId: order.id,
    paymentMethod: 'Chapa',
    paymentStatus: 'Pending',
    transactionReference: txRef,
    paymentDate: null,
  });

  return {
    checkoutUrl: data?.data?.checkout_url,
    txRef,
  };
};

export const verifyChapaPayment = async (orderId: string, txRef: string) => {
  const { order, method } = await getChapaMethodForOrder(orderId);
  const res = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${method.chapaSecretKey}`,
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = typeof data?.message === 'string' ? data.message : JSON.stringify(data);
    throw new Error(msg || 'Chapa verify failed');
  }

  const status = data?.status || data?.data?.status;
  const isPaid = String(status).toLowerCase() === 'success';

  const payment = await models.Payment.findOne({ where: { orderId: order.id, transactionReference: txRef } });
  if (payment) {
    await payment.update({
      paymentStatus: isPaid ? 'Paid' : 'Failed',
      paymentDate: isPaid ? new Date() : payment.paymentDate,
    });
  }

  if (isPaid) {
    const table = await models.Table.findByPk(order.tableId);
    if (table) {
      await setTableStatus(order.tableId, order.status === 'Delivered' ? 'enjoying' : 'paid');
      try {
        const io = getSocket();
        io.to(`admin:${table.businessId}`).emit('PaymentCompleted', {
          orderId: order.id,
          tableId: order.tableId,
          businessId: table.businessId,
          amount: order.totalAmount,
          paymentId: payment?.id || '',
          paymentMethod: 'Chapa',
          paymentDate: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
    }
  }

  return { status, paid: isPaid };
};
