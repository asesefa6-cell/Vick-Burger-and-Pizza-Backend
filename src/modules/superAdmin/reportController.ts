import { Request, Response, NextFunction } from 'express';
import { getConsolidatedSales, getRecentActivity, getSalesSeries } from './reportService';

const escapeCsv = (value: string | number) => {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const consolidatedSalesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const report = await getConsolidatedSales((req as any).validatedQuery || (req.query as any));
    res.status(200).json({ success: true, message: 'Consolidated sales report generated', data: report });
  } catch (error) {
    next(error);
  }
};

export const salesSeriesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const series = await getSalesSeries((req as any).validatedQuery || (req.query as any));
    res.status(200).json({ success: true, message: 'Sales series generated', data: series });
  } catch (error) {
    next(error);
  }
};

export const recentActivityHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Number(req.query.limit || 5);
    const activity = await getRecentActivity(Number.isFinite(limit) ? limit : 5);
    res.status(200).json({ success: true, message: 'Recent activity fetched', data: activity });
  } catch (error) {
    next(error);
  }
};

export const exportSalesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = (req as any).validatedQuery || (req.query as any);
    const report = await getConsolidatedSales(query);
    const limit = query.limit ? Number(query.limit) : undefined;
    const offset = query.offset ? Number(query.offset) : 0;

    let rows = report.businesses;
    if (offset) rows = rows.slice(offset);
    if (limit) rows = rows.slice(0, limit);

    const header = ['businessId', 'businessName', 'totalOrders', 'totalRevenue', 'period', 'startDate', 'endDate'];
    const lines = [header.join(',')];

    for (const b of rows) {
      lines.push([
        escapeCsv(b.businessId),
        escapeCsv(b.businessName),
        escapeCsv(b.totalOrders),
        escapeCsv(b.totalRevenue),
        escapeCsv(report.period),
        escapeCsv(report.startDate),
        escapeCsv(report.endDate),
      ].join(','));
    }

    lines.push([
      'TOTAL',
      '',
      escapeCsv(report.totalOrders),
      escapeCsv(report.totalRevenue),
      escapeCsv(report.period),
      escapeCsv(report.startDate),
      escapeCsv(report.endDate),
    ].join(','));

    const csv = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="consolidated-report-${report.period}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
