import { Op, fn, col, literal } from 'sequelize';
import { models } from '../../db';
import { Category } from '../../models/Category';
import { MenuItem } from '../../models/MenuItem';
import { Order } from '../../models/Order';
import { OrderItem } from '../../models/OrderItem';
import { Payment } from '../../models/Payment';
import {
  SalesReportQuery,
  SalesSummary,
  AnalyticsQuery,
  AnalyticsSummary,
  TopItem,
} from './types';

const resolveDateRange = (period: SalesReportQuery['period'], startDate?: string, endDate?: string) => {
  const now = new Date();
  if (startDate && endDate) {
    return { start: new Date(startDate), end: new Date(endDate) };
  }

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

const toDateString = (date: Date): string => date.toISOString();

const businessInclude = (businessId?: string) => {
  if (!businessId) return [];
  return [
    {
      model: models.Table,
      as: 'table',
      attributes: [],
      required: true,
      include: [
        {
          model: models.Business,
          as: 'business',
          attributes: [],
          where: { id: businessId },
          required: true,
        },
      ],
    },
  ];
};

export const getSalesSummary = async (query: SalesReportQuery & { businessId?: string }): Promise<SalesSummary> => {
  const { start, end } = resolveDateRange(query.period, query.startDate, query.endDate);

  const orderWhere: Record<string, unknown> = {
    createdAt: { [Op.between]: [start, end] },
  };

  if (query.tableId) {
    orderWhere.tableId = query.tableId;
  }

  const paymentWhere: Record<string, unknown> | undefined = query.paymentMethod
    ? { paymentMethod: query.paymentMethod }
    : undefined;

  const orderAggregate = await models.Order.findOne({
    attributes: [
      [fn('count', col('Order.order_id')), 'totalOrders'],
      [fn('coalesce', fn('sum', col('Order.total_amount')), 0), 'totalRevenue'],
    ],
    where: orderWhere,
    include: [
      ...(paymentWhere
        ? [{ model: Payment, as: 'payment', attributes: [], where: paymentWhere, required: true }]
        : []),
      ...businessInclude(query.businessId),
    ],
    raw: true,
  });

  const categoryWhere: Record<string, unknown> = {};
  if (query.categoryId) {
    categoryWhere.id = query.categoryId;
  }

  const categoryRows = await models.OrderItem.findAll({
    attributes: [
      [col('menuItem.category.category_id'), 'categoryId'],
      [col('menuItem.category.category_name'), 'categoryName'],
      [fn('sum', col('OrderItem.quantity')), 'totalQuantity'],
      [fn('sum', literal('"OrderItem"."quantity" * "menuItem"."price"')), 'totalRevenue'],
    ],
    include: [
      {
        model: MenuItem,
        as: 'menuItem',
        attributes: [],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: [],
            where: categoryWhere,
            required: !!query.categoryId,
          },
        ],
        required: true,
      },
      {
        model: Order,
        as: 'order',
        attributes: [],
        where: orderWhere,
        required: true,
        include: [
          ...(paymentWhere
            ? [{ model: Payment, as: 'payment', attributes: [], where: paymentWhere, required: true }]
            : []),
          ...businessInclude(query.businessId),
        ],
      },
    ],
    group: ['menuItem.category.category_id', 'menuItem.category.category_name'],
    raw: true,
  });

  const totalOrders = Number(orderAggregate?.totalOrders || 0);
  const totalRevenue = String(orderAggregate?.totalRevenue || '0');

  const categoryBreakdown = categoryRows.map((row) => ({
    categoryId: String(row.categoryId),
    categoryName: String(row.categoryName),
    totalQuantity: Number(row.totalQuantity || 0),
    totalRevenue: String(row.totalRevenue || '0'),
  }));

  return {
    period: query.period,
    startDate: toDateString(start),
    endDate: toDateString(end),
    totalOrders,
    totalRevenue,
    categoryBreakdown,
  };
};

export const getOrderAnalytics = async (query: AnalyticsQuery & { businessId?: string }): Promise<AnalyticsSummary> => {
  const { start, end } = resolveDateRange(query.period, query.startDate, query.endDate);

  const orderWhere = {
    createdAt: { [Op.between]: [start, end] },
  };

  const orderAggregate = await models.Order.findOne({
    attributes: [
      [fn('count', col('Order.order_id')), 'totalOrders'],
      [fn('coalesce', fn('avg', col('Order.total_amount')), 0), 'averageOrderValue'],
    ],
    where: orderWhere,
    include: [...businessInclude(query.businessId)],
    raw: true,
  });

  const itemRows = await models.OrderItem.findAll({
    attributes: [
      [col('menuItem.item_id'), 'itemId'],
      [col('menuItem.item_name'), 'itemName'],
      [fn('sum', col('OrderItem.quantity')), 'totalQuantity'],
      [fn('sum', literal('"OrderItem"."quantity" * "menuItem"."price"')), 'totalRevenue'],
    ],
    include: [
      {
        model: MenuItem,
        as: 'menuItem',
        attributes: [],
        required: true,
      },
      {
        model: Order,
        as: 'order',
        attributes: [],
        where: orderWhere,
        required: true,
        include: [...businessInclude(query.businessId)],
      },
    ],
    group: ['menuItem.item_id', 'menuItem.item_name'],
    order: [[fn('sum', col('OrderItem.quantity')), 'DESC']],
    limit: 10,
    raw: true,
  });

  const topItems: TopItem[] = itemRows.map((row) => ({
    itemId: String(row.itemId),
    itemName: String(row.itemName),
    totalQuantity: Number(row.totalQuantity || 0),
    totalRevenue: String(row.totalRevenue || '0'),
  }));

  return {
    period: query.period,
    startDate: toDateString(start),
    endDate: toDateString(end),
    averageOrderValue: String(orderAggregate?.averageOrderValue || '0'),
    totalOrders: Number(orderAggregate?.totalOrders || 0),
    topItems,
  };
};
