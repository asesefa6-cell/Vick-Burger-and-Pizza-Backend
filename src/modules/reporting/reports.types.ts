export interface OrdersPerTable {
  tableId: string;
  tableNumber: string;
  totalOrders: number;
  totalRevenue: string;
}

export interface TopSellingItem {
  itemId: string;
  itemName: string;
  totalQuantity: number;
  totalRevenue: string;
}

export interface TrendPoint {
  period: string;
  totalOrders: number;
  totalRevenue: string;
}

export interface DailyReport {
  businessId: string;
  date: string;
  totalOrders: number;
  totalRevenue: string;
  ordersPerTable: OrdersPerTable[];
  topItems: TopSellingItem[];
  orderStatusSummary: Record<string, number>;
}

export interface PeriodReport {
  businessId: string;
  period: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  totalOrders: number;
  totalRevenue: string;
  trends: TrendPoint[];
  topItems: TopSellingItem[];
  orderStatusSummary: Record<string, number>;
}

export interface OrderStatusReport {
  businessId: string;
  startDate: string;
  endDate: string;
  statusCounts: Record<string, number>;
}

export interface BusinessPerformance {
  businessId: string;
  totalRevenue: string;
  totalOrders: number;
  tableUtilization: Array<{
    tableId: string;
    tableNumber: string;
    totalOrders: number;
    utilizationRate: number;
  }>;
}
