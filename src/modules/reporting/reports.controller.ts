import { Request, Response, NextFunction } from 'express';
import {
  getDailyReport,
  getWeeklyOrMonthlyReport,
  getOrderStatusSummary,
  getBusinessPerformance,
} from './reports.service';

const getBusinessId = (req: Request): string => String(req.query.businessId);

export const dailyReportHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = getBusinessId(req);
    const report = await getDailyReport(businessId);
    const performance = await getBusinessPerformance(businessId);
    res.status(200).json({ success: true, message: 'Daily report generated', data: { ...report, performance } });
  } catch (error) {
    next(error);
  }
};

export const weeklyReportHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = getBusinessId(req);
    const report = await getWeeklyOrMonthlyReport(businessId, 'weekly');
    const performance = await getBusinessPerformance(businessId);
    res.status(200).json({ success: true, message: 'Weekly report generated', data: { ...report, performance } });
  } catch (error) {
    next(error);
  }
};

export const monthlyReportHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = getBusinessId(req);
    const report = await getWeeklyOrMonthlyReport(businessId, 'monthly');
    const performance = await getBusinessPerformance(businessId);
    res.status(200).json({ success: true, message: 'Monthly report generated', data: { ...report, performance } });
  } catch (error) {
    next(error);
  }
};

export const orderStatusReportHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = getBusinessId(req);
    const report = await getOrderStatusSummary(businessId);
    res.status(200).json({ success: true, message: 'Order status report generated', data: report });
  } catch (error) {
    next(error);
  }
};
