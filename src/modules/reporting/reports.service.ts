import { Op, fn, col, literal } from 'sequelize';
import { models } from '../../db';
import {
  DailyReport,
  PeriodReport,
  OrderStatusReport,
  OrdersPerTable,
  TopSellingItem,
  TrendPoint,
  BusinessPerformance,
} from './reports.types';

const resolveDateRange = (period: 'daily' | 'weekly' | 'monthly') => {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);

  if (period === 'daily') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setMonth(start.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end };
};

const statusSummaryFromRows = (rows: Array<{ status: string; count: string | number }>) => {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = Number(row.count);
    return acc;
  }, {});
};

export const getDailyReport = async (businessId: string): Promise<DailyReport> => {
  const { start, end } = resolveDateRange('daily');

  const orderWhere: Record<string, unknown> = {
    createdAt: { [Op.between]: [start, end] },
  };

  const totalRow = (await models.Order.findOne({
    attributes: [
      [fn('count', col('Order.id')), 'totalOrders'],
      [fn('coalesce', fn('sum', col('Order.totalAmount')), 0), 'totalRevenue'],
    ],
    where: orderWhere,
    include: [
      {
        model: models.Table,
        as: 'table',
        attributes: [],
        where: { businessId },
        required: true,
      },
    ],
    raw: true,
  })) as unknown as { totalOrders?: number | string; totalRevenue?: number | string } | null;

  const ordersPerTableRows = (await models.Order.findAll({
    attributes: [
      [col('table.id'), 'tableId'],
      [col('table.tableNumber'), 'tableNumber'],
      [fn('count', col('Order.id')), 'totalOrders'],
      [fn('coalesce', fn('sum', col('Order.totalAmount')), 0), 'totalRevenue'],
    ],
    where: orderWhere,
    include: [
      {
        model: models.Table,
        as: 'table',
        attributes: [],
        where: { businessId },
        required: true,
      },
    ],
    group: ['table.id', 'table.tableNumber'],
    order: [[fn('count', col('Order.id')), 'DESC']],
    raw: true,
  })) as unknown as Array<{ tableId?: string; tableNumber?: string; totalOrders?: number | string; totalRevenue?: number | string }>;

  const ordersPerTable: OrdersPerTable[] = ordersPerTableRows.map((row) => ({
    tableId: String(row.tableId),
    tableNumber: String(row.tableNumber),
    totalOrders: Number(row.totalOrders || 0),
    totalRevenue: String(row.totalRevenue || '0'),
  }));

  const topItemsRows = (await models.OrderItem.findAll({
    attributes: [
      [col('menuItem.id'), 'itemId'],
      [col('menuItem.itemName'), 'itemName'],
      [fn('sum', col('OrderItem.quantity')), 'totalQuantity'],
      [
        fn('sum', literal('"OrderItem"."quantity" * "menuItem"."price"')),
        'totalRevenue',
      ],
    ],
    include: [
      {
        model: models.MenuItem,
        as: 'menuItem',
        attributes: [],
        required: true,
      },
      {
        model: models.Order,
        as: 'order',
        attributes: [],
        where: orderWhere,
        required: true,
        include: [
          {
            model: models.Table,
            as: 'table',
            attributes: [],
            where: { businessId },
            required: true,
          },
        ],
      },
    ],
    group: ['menuItem.id', 'menuItem.itemName'],
    order: [[fn('sum', col('OrderItem.quantity')), 'DESC']],
    limit: 10,
    raw: true,
  })) as unknown as Array<{ itemId?: string; itemName?: string; totalQuantity?: number | string; totalRevenue?: number | string }>;

  const topItems: TopSellingItem[] = topItemsRows.map((row) => ({
    itemId: String(row.itemId),
    itemName: String(row.itemName),
    totalQuantity: Number(row.totalQuantity || 0),
    totalRevenue: String(row.totalRevenue || '0'),
  }));

  const statusRows = await models.Order.findAll({
    attributes: [[col('status'), 'status'], [fn('count', col('Order.id')), 'count']],
    where: orderWhere,
    include: [
      {
        model: models.Table,
        as: 'table',
        attributes: [],
        where: { businessId },
        required: true,
      },
    ],
    group: ['status'],
    raw: true,
  });

  return {
    businessId,
    date: start.toISOString(),
    totalOrders: Number(totalRow?.totalOrders || 0),
    totalRevenue: String(totalRow?.totalRevenue || '0'),
    ordersPerTable,
    topItems,
    orderStatusSummary: statusSummaryFromRows(statusRows as any),
  };
};

export const getWeeklyOrMonthlyReport = async (
  businessId: string,
  period: 'weekly' | 'monthly'
): Promise<PeriodReport> => {
  const { start, end } = resolveDateRange(period);

  const orderWhere: Record<string, unknown> = {
    createdAt: { [Op.between]: [start, end] },
  };

  const totalRow = (await models.Order.findOne({
    attributes: [
      [fn('count', col('Order.id')), 'totalOrders'],
      [fn('coalesce', fn('sum', col('Order.totalAmount')), 0), 'totalRevenue'],
    ],
    where: orderWhere,
    include: [
      {
        model: models.Table,
        as: 'table',
        attributes: [],
        where: { businessId },
        required: true,
      },
    ],
    raw: true,
  })) as unknown as { totalOrders?: number | string; totalRevenue?: number | string } | null;

  const trendRows = (await models.Order.findAll({
    attributes: [
      [literal("date_trunc('day', \"Order\".\"created_at\")"), 'period'],
      [fn('count', col('Order.id')), 'totalOrders'],
      [fn('coalesce', fn('sum', col('Order.totalAmount')), 0), 'totalRevenue'],
    ],
    where: orderWhere,
    include: [
      {
        model: models.Table,
        as: 'table',
        attributes: [],
        where: { businessId },
        required: true,
      },
    ],
    group: [literal("date_trunc('day', \"Order\".\"created_at\")") as any],
    order: [[literal("date_trunc('day', \"Order\".\"created_at\")") as any, 'ASC']],
    raw: true,
  })) as unknown as Array<{ period?: string; totalOrders?: number | string; totalRevenue?: number | string }>;

  const trends: TrendPoint[] = trendRows.map((row) => ({
    period: String(row.period),
    totalOrders: Number(row.totalOrders || 0),
    totalRevenue: String(row.totalRevenue || '0'),
  }));

  const topItemsRows = (await models.OrderItem.findAll({
    attributes: [
      [col('menuItem.id'), 'itemId'],
      [col('menuItem.itemName'), 'itemName'],
      [fn('sum', col('OrderItem.quantity')), 'totalQuantity'],
      [
        fn('sum', literal('"OrderItem"."quantity" * "menuItem"."price"')),
        'totalRevenue',
      ],
    ],
    include: [
      {
        model: models.MenuItem,
        as: 'menuItem',
        attributes: [],
        required: true,
      },
      {
        model: models.Order,
        as: 'order',
        attributes: [],
        where: orderWhere,
        required: true,
        include: [
          {
            model: models.Table,
            as: 'table',
            attributes: [],
            where: { businessId },
            required: true,
          },
        ],
      },
    ],
    group: ['menuItem.id', 'menuItem.itemName'],
    order: [[fn('sum', col('OrderItem.quantity')), 'DESC']],
    limit: 10,
    raw: true,
  })) as unknown as Array<{ itemId?: string; itemName?: string; totalQuantity?: number | string; totalRevenue?: number | string }>;

  const topItems: TopSellingItem[] = topItemsRows.map((row) => ({
    itemId: String(row.itemId),
    itemName: String(row.itemName),
    totalQuantity: Number(row.totalQuantity || 0),
    totalRevenue: String(row.totalRevenue || '0'),
  }));

  const statusRows = await models.Order.findAll({
    attributes: [[col('status'), 'status'], [fn('count', col('Order.id')), 'count']],
    where: orderWhere,
    include: [
      {
        model: models.Table,
        as: 'table',
        attributes: [],
        where: { businessId },
        required: true,
      },
    ],
    group: ['status'],
    raw: true,
  });

  return {
    businessId,
    period,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    totalOrders: Number(totalRow?.totalOrders || 0),
    totalRevenue: String(totalRow?.totalRevenue || '0'),
    trends,
    topItems,
    orderStatusSummary: statusSummaryFromRows(statusRows as any),
  };
};

export const getOrderStatusSummary = async (businessId: string): Promise<OrderStatusReport> => {
  const { start, end } = resolveDateRange('monthly');

  const rows = await models.Order.findAll({
    attributes: [[col('status'), 'status'], [fn('count', col('Order.id')), 'count']],
    where: {
      createdAt: { [Op.between]: [start, end] },
    },
    include: [
      {
        model: models.Table,
        as: 'table',
        attributes: [],
        where: { businessId },
        required: true,
      },
    ],
    group: ['status'],
    raw: true,
  });

  return {
    businessId,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    statusCounts: statusSummaryFromRows(rows as any),
  };
};

export const getBusinessPerformance = async (businessId: string): Promise<BusinessPerformance> => {
  const totalRow = (await models.Order.findOne({
    attributes: [
      [fn('count', col('Order.id')), 'totalOrders'],
      [fn('coalesce', fn('sum', col('Order.totalAmount')), 0), 'totalRevenue'],
    ],
    include: [
      {
        model: models.Table,
        as: 'table',
        attributes: [],
        where: { businessId },
        required: true,
      },
    ],
    raw: true,
  })) as unknown as { totalOrders?: number | string; totalRevenue?: number | string } | null;

  const perTableRows = (await models.Order.findAll({
    attributes: [
      [col('table.id'), 'tableId'],
      [col('table.tableNumber'), 'tableNumber'],
      [fn('count', col('Order.id')), 'totalOrders'],
    ],
    include: [
      {
        model: models.Table,
        as: 'table',
        attributes: [],
        where: { businessId },
        required: true,
      },
    ],
    group: ['table.id', 'table.tableNumber'],
    raw: true,
  })) as unknown as Array<{ tableId?: string; tableNumber?: string; totalOrders?: number | string }>;

  const totalOrders = Number(totalRow?.totalOrders || 0);

  const tableUtilization = perTableRows.map((row) => {
    const tableOrders = Number(row.totalOrders || 0);
    const utilizationRate = totalOrders > 0 ? Number(((tableOrders / totalOrders) * 100).toFixed(2)) : 0;
    return {
      tableId: String(row.tableId),
      tableNumber: String(row.tableNumber),
      totalOrders: tableOrders,
      utilizationRate,
    };
  });

  return {
    businessId,
    totalOrders,
    totalRevenue: String(totalRow?.totalRevenue || '0'),
    tableUtilization,
  };
};
