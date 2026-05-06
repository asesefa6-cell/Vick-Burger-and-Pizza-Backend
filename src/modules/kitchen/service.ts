import { Op } from "sequelize";
import { models } from "../../db";
import { ActiveOrder, ActiveOrdersQuery, UpdateStatusInput } from "./types";
import { updateOrderStatus } from "../order/service";

export const getActiveOrders = async (
  query: ActiveOrdersQuery,
): Promise<{ rows: ActiveOrder[]; total: number }> => {
  const where: Record<string, unknown> = {};

  if (query.status) {
    where.status = query.status;
  } else {
    where.status = { [Op.in]: ["Pending", "Preparing"] };
  }

  if (query.tableId) {
    where.tableId = query.tableId;
  }

  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 50)));
  const offset = (page - 1) * limit;

  const { rows, count } = await models.Order.findAndCountAll({
    where,
    include: [
      {
        model: models.Table,
        as: "table",
        attributes: ["id", "tableNumber"],
      },
      {
        model: models.OrderItem,
        as: "orderItems",
        attributes: ["itemId", "quantity", "specialInstruction"],
        include: [
          {
            model: models.MenuItem,
            as: "menuItem",
            attributes: ["id", "itemName", "imageUrl", "directToWaiter"],
          },
        ],
      },
    ],
    order: [["createdAt", "ASC"]],
    limit,
    offset,
    distinct: true,
  });

  const activeOrders = rows
    .map((order) => {
      const kitchenItems =
        order.orderItems?.filter((item) => !item.menuItem?.directToWaiter) ||
        [];
      if (kitchenItems.length === 0) return null;
      return {
        orderId: order.id,
        tableId: order.tableId,
        tableNumber: order.table?.tableNumber || "",
        status: order.status as ActiveOrder["status"],
        totalAmount: order.totalAmount,
        timePlaced: order.createdAt.toISOString(),
        items:
          kitchenItems.map((item) => ({
            itemId: item.itemId,
            itemName: item.menuItem?.itemName || "",
            itemImageUrl: item.menuItem?.imageUrl || null,
            quantity: item.quantity,
            specialInstruction: item.specialInstruction ?? null,
          })) || [],
      };
    })
    .filter((o) => o !== null) as ActiveOrder[];

  return { rows: activeOrders, total: count };
};

export const updateKitchenOrderStatus = async (
  orderId: string,
  input: UpdateStatusInput,
) => {
  return await updateOrderStatus(orderId, input);
};

export const getKitchenAnalytics = async (
  businessId?: string | null,
  filter: "today" | "all_time" = "today",
  page = 1,
  limit = 10,
) => {
  const where: Record<string, unknown> = {};
  if (filter === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    where.createdAt = { [Op.gte]: start };
  }
  const orders = await models.Order.findAll({
    where,
    include: [
      {
        model: models.Table,
        as: "table",
        attributes: ["businessId", "tableNumber"],
        ...(businessId ? { where: { businessId } } : {}),
      },
      {
        model: models.OrderItem,
        as: "orderItems",
        include: [{ model: models.MenuItem, as: "menuItem" }],
      },
    ],
    attributes: ["id", "status", "totalAmount", "createdAt"],
  });
  const completed = orders.filter(
    (o) =>
      String(o.status).toLowerCase() === "ready" ||
      String(o.status).toLowerCase() === "delivered",
  );
  const producedAmount = completed.reduce(
    (sum, o) => sum + Number(o.totalAmount || 0),
    0,
  );
  const allItems = completed.map((o: any) => ({
    orderId: o.id,
    tableNumber: o.table?.tableNumber || "—",
    totalAmount: Number(o.totalAmount || 0),
    completedAt: o.createdAt,
    foods: (o.orderItems || []).map((oi: any) => ({
      itemName: oi.menuItem?.itemName || "Item",
      quantity: oi.quantity,
    })),
  }));
  const total = allItems.length;
  const startIndex = (page - 1) * limit;
  const paged = allItems.slice(startIndex, startIndex + limit);
  return {
    completedOrders: completed.length,
    producedAmount,
    completedItems: paged,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};
