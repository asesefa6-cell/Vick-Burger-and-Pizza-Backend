import { Op, fn, col, literal } from 'sequelize';
import { models } from '../../db';

interface ConsolidatedQuery {
  period: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
  businessId?: string;
}

interface BusinessBreakdown {
  businessId: string;
  businessName: string;
  totalOrders: number;
  totalRevenue: string;
}

interface ConsolidatedSalesReport {
  period: ConsolidatedQuery['period'];
  startDate: string;
  endDate: string;
  totalOrders: number;
  totalRevenue: string;
  businesses: BusinessBreakdown[];
}

interface SalesPoint {
  date: string;
  totalRevenue: string;
  totalOrders: number;
}

interface RecentOrder {
  id: string;
  tableNumber: string;
  businessName: string;
  totalAmount: string;
  status: string;
  createdAt: string;
}

const resolveDateRange = (period: ConsolidatedQuery['period'], startDate?: string, endDate?: string) => {
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

export const getConsolidatedSales = async (query: ConsolidatedQuery): Promise<ConsolidatedSalesReport> => {
  const { start, end } = resolveDateRange(query.period, query.startDate, query.endDate);

  const orderWhere: Record<string, unknown> = {
    createdAt: { [Op.between]: [start, end] },
  };

  const businessWhere: Record<string, unknown> = {};
  if (query.businessId) {
    businessWhere.id = query.businessId;
  }

  const rows = await models.Order.findAll({
    attributes: [
      [col('table.business.business_id'), 'businessId'],
      [col('table.business.business_name'), 'businessName'],
      [fn('count', col('Order.order_id')), 'totalOrders'],
      [fn('coalesce', fn('sum', col('Order.total_amount')), 0), 'totalRevenue'],
    ],
    where: orderWhere,
    include: [
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
            where: businessWhere,
            required: Object.keys(businessWhere).length > 0,
          },
        ],
      },
    ],
    group: ['table.business.business_id', 'table.business.business_name'],
    raw: true,
  });

  const businesses: BusinessBreakdown[] = rows.map((row) => ({
    businessId: String(row.businessId),
    businessName: String(row.businessName),
    totalOrders: Number(row.totalOrders || 0),
    totalRevenue: String(row.totalRevenue || '0'),
  }));

  const totals = businesses.reduce(
    (acc, b) => ({
      totalOrders: acc.totalOrders + b.totalOrders,
      totalRevenue: (Number(acc.totalRevenue) + Number(b.totalRevenue)).toFixed(2),
    }),
    { totalOrders: 0, totalRevenue: '0' }
  );

  return {
    period: query.period,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    totalOrders: totals.totalOrders,
    totalRevenue: totals.totalRevenue,
    businesses,
  };
};

export const getSalesSeries = async (query: ConsolidatedQuery): Promise<SalesPoint[]> => {
  const { start, end } = resolveDateRange(query.period, query.startDate, query.endDate);

  const businessWhere: Record<string, unknown> = {};
  if (query.businessId) {
    businessWhere.id = query.businessId;
  }

  const rows = await models.Order.findAll({
    attributes: [
      [fn('date_trunc', 'day', col('Order.created_at')), 'bucket'],
      [fn('coalesce', fn('sum', col('Order.total_amount')), 0), 'totalRevenue'],
      [fn('count', col('Order.order_id')), 'totalOrders'],
    ],
    where: { createdAt: { [Op.between]: [start, end] } },
    include: [
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
            where: businessWhere,
            required: Object.keys(businessWhere).length > 0,
          },
        ],
      },
    ],
    group: [literal('bucket')],
    order: [literal('bucket ASC')],
    raw: true,
  });

  return rows.map((row) => ({
    date: new Date(String(row.bucket)).toISOString().slice(0, 10),
    totalRevenue: String(row.totalRevenue || '0'),
    totalOrders: Number(row.totalOrders || 0),
  }));
};

export const getRecentActivity = async (limit = 5): Promise<RecentOrder[]> => {
  const rows = await models.Order.findAll({
    attributes: ['order_id', 'total_amount', 'status', 'created_at'],
    include: [
      {
        model: models.Table,
        as: 'table',
        attributes: ['tableNumber'],
        include: [
          {
            model: models.Business,
            as: 'business',
            attributes: ['businessName'],
          },
        ],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    raw: true,
  });

  return rows.map((row: any) => ({
    id: row.order_id,
    tableNumber: row['table.tableNumber'] ?? '—',
    businessName: row['table.business.businessName'] ?? '—',
    totalAmount: String(row.total_amount ?? '0'),
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  }));
};
