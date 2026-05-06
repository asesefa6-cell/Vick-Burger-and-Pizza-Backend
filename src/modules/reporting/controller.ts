import { Request, Response, NextFunction } from "express";
import { getOrderAnalytics, getSalesSummary } from "./service";
import { SalesReportQuery, AnalyticsQuery } from "./types";

export const salesReportHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = ((req as any).validatedQuery ||
      req.query) as unknown as SalesReportQuery & { businessId?: string };

    if (req.user?.role !== "Super Admin") {
      parsed.businessId =
        req.user?.businessId || "00000000-0000-0000-0000-000000000000";
    }

    const report = await getSalesSummary(parsed);
    res
      .status(200)
      .json({ success: true, message: "Sales report generated", data: report });
  } catch (error) {
    next(error);
  }
};

export const analyticsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = ((req as any).validatedQuery ||
      req.query) as unknown as AnalyticsQuery & { businessId?: string };

    if (req.user?.role !== "Super Admin") {
      parsed.businessId =
        req.user?.businessId || "00000000-0000-0000-0000-000000000000";
    }

    const report = await getOrderAnalytics(parsed);
    res
      .status(200)
      .json({ success: true, message: "Analytics generated", data: report });
  } catch (error) {
    next(error);
  }
};
