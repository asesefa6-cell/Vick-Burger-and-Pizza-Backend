import { Request, Response, NextFunction } from "express";
import {
  getActiveOrders,
  updateKitchenOrderStatus,
  getKitchenAnalytics,
} from "./service";
import { ActiveOrdersQuery } from "./types";
import { parseIdParam } from "../_shared/validation";

const canUpdateStatus = (role: string | undefined, status: string): boolean => {
  if (!role) return false;
  if (role === "Admin" || role === "Super Admin" || role === "Manager")
    return true;
  if (role === "Chef") return status === "Preparing" || status === "Ready";
  if (role === "Waiter") return status === "Delivered";
  return false;
};

export const getActiveOrdersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tableId = req.query.tableId ? String(req.query.tableId) : undefined;
    const status = req.query.status
      ? (String(req.query.status) as any)
      : undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const query: ActiveOrdersQuery = {};
    if (tableId !== undefined) query.tableId = tableId;
    if (status !== undefined) query.status = status;
    if (page !== undefined) query.page = page;
    if (limit !== undefined) query.limit = limit;

    const result = await getActiveOrders(query);
    res.status(200).json({
      success: true,
      message: "Active orders fetched",
      data: result.rows,
      pagination: {
        page: page || 1,
        limit: limit || 10,
        total: result.total,
        totalPages: Math.ceil(result.total / (limit || 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (!id) {
      res.status(400).json({ success: false, message: "Invalid id" });
      return;
    }

    if (!canUpdateStatus(req.user?.role, req.body?.status)) {
      res
        .status(403)
        .json({ success: false, message: "Forbidden for this role" });
      return;
    }

    const order = await updateKitchenOrderStatus(id, req.body);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid status transition"
    ) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const kitchenAnalyticsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const role = req.user?.role;
    const businessId =
      role === "Super Admin" ? undefined : req.user?.businessId;
    const filter = req.query.filter === "all_time" ? "all_time" : "today";
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const data = await getKitchenAnalytics(businessId, filter, page, limit);
    res
      .status(200)
      .json({ success: true, message: "Kitchen analytics fetched", data });
  } catch (error) {
    next(error);
  }
};
