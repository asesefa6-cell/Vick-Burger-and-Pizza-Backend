export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface SalesReportQuery {
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
  tableId?: string;
  categoryId?: string;
  paymentMethod?: string;
}

export interface SalesSummary {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  totalOrders: number;
  totalRevenue: string;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    totalQuantity: number;
    totalRevenue: string;
  }>;
}

export interface AnalyticsQuery {
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
}

export interface TopItem {
  itemId: string;
  itemName: string;
  totalQuantity: number;
  totalRevenue: string;
}

export interface AnalyticsSummary {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  averageOrderValue: string;
  totalOrders: number;
  topItems: TopItem[];
}
