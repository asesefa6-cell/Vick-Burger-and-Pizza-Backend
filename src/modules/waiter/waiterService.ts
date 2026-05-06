import { models } from "../../db";
import { setTableStatus } from "../_shared/tableStatus";
import { Op, fn, col } from "sequelize";

export const getAssignedTablesForWaiter = async (waiterId: string) => {
  const ratingData = await models.TableRating.findOne({
    where: { waiterId },
    attributes: [[fn("AVG", col("rating")), "avgRating"]],
    raw: true,
  });
  const avgRating = Number((ratingData as any)?.avgRating || 0).toFixed(1);

  const assignments = await models.TableAssignment.findAll({
    where: { waiterId },
    include: [{ model: models.Table, as: "table" }],
    order: [["createdAt", "DESC"]],
  });

  const results = await Promise.all(
    assignments.map(async (assignment) => {
      const table = assignment.table;
      if (!table || table.status === "waiting") {
        return {
          assignment,
          table: table || null,
          order: null,
          paymentStatus: null,
          paid: false,
        };
      }

      const orders = await models.Order.findAll({
        where: {
          tableId: table.id,
          status: { [Op.in]: ["Pending", "Preparing", "Ready", "Delivered"] },
          createdAt: {
            [Op.gte]: new Date(assignment.createdAt.getTime() - 5 * 60000),
          },
        },
        include: [
          {
            model: models.OrderItem,
            as: "orderItems",
            include: [{ model: models.MenuItem, as: "menuItem" }],
          },
          { model: models.Payment },
          { model: models.Table, as: "table" },
        ],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });

      // Prioritize the order that needs action (Ready > Preparing > Pending)
      const readyOrder = orders.find((o) => o.status === "Ready");
      const activeOrder =
        readyOrder ||
        orders.find((o) => ["Preparing", "Pending"].includes(o.status)) ||
        orders[0];

      const paymentStatus = activeOrder?.payment?.paymentStatus ?? null;
      const paid =
        table.status === "paid" ||
        table.status === "enjoying" ||
        (paymentStatus ? paymentStatus.toLowerCase() === "paid" : false);

      // Consolidate non-delivered items for a cleaner "to-do" list
      const combinedOrderItems: any[] = [];
      orders
        .filter((o) => o.status !== "Delivered")
        .forEach((o: any) => {
          (o.orderItems ?? []).forEach((oi: any) => {
            const existing = combinedOrderItems.find(
              (item) =>
                item.itemId === oi.itemId &&
                item.specialInstruction === oi.specialInstruction,
            );
            if (existing) {
              existing.quantity += oi.quantity;
            } else {
              const itemJson = oi.toJSON();
              if (itemJson.menuItem) {
                itemJson.menuItem.itemName = oi.menuItem?.itemName;
              }
              combinedOrderItems.push(itemJson);
            }
          });
        });

      const orderWithCombinedItems = activeOrder
        ? {
            ...activeOrder.toJSON(),
            orderItems: combinedOrderItems,
          }
        : null;

      return {
        assignment,
        table,
        order: orderWithCombinedItems,
        orders,
        paymentStatus,
        paid,
      };
    }),
  );

  return { rows: results, avgRating };
};

export const getWaiterAnalytics = async (
  waiterId: string,
  filter: "today" | "all_time" = "today",
  page = 1,
  limit = 10,
) => {
  const assignments = await models.TableAssignment.findAll({
    where: { waiterId },
  });
  const tableIds = assignments.map((a) => a.tableId);
  if (tableIds.length === 0) {
    return { deliveredOrders: 0, deliveredAmount: 0, deliveredItems: [] };
  }
  const where: Record<string, unknown> = {
    tableId: { [Op.in]: tableIds },
    status: "Delivered",
  };
  if (filter === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    where.createdAt = { [Op.gte]: start };
  }
  const deliveredOrders = await models.Order.findAll({
    where,
    include: [
      {
        model: models.Payment,
        required: true,
        where: { paymentStatus: "Paid" },
      },
      {
        model: models.OrderItem,
        as: "orderItems",
        include: [{ model: models.MenuItem, as: "menuItem" }],
      },
    ],
    attributes: ["id", "totalAmount", "tableId", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
  const deliveredAmount = deliveredOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0,
  );
  const deliveredTableIds = Array.from(
    new Set(deliveredOrders.map((o) => o.tableId)),
  );
  const tables = await models.Table.findAll({
    where: { id: { [Op.in]: deliveredTableIds } },
    attributes: ["id", "tableNumber"],
  });
  const tableMap = new Map(tables.map((t) => [t.id, t.tableNumber]));
  const allDeliveredItems = deliveredOrders.map((order: any) => ({
    orderId: order.id,
    tableId: order.tableId,
    tableNumber: tableMap.get(order.tableId) || "—",
    totalAmount: Number(order.totalAmount || 0),
    deliveredAt: order.createdAt,
    foods: (order.orderItems || []).map((oi: any) => ({
      itemName: oi.menuItem?.itemName || "Item",
      quantity: oi.quantity,
    })),
  }));
  const total = allDeliveredItems.length;
  const startIndex = (page - 1) * limit;
  const paged = allDeliveredItems.slice(startIndex, startIndex + limit);
  return {
    deliveredOrders: deliveredOrders.length,
    deliveredAmount,
    deliveredItems: paged,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const completeTableVisit = async (waiterId: string, tableId: string) => {
  const assignment = await models.TableAssignment.findOne({
    where: { waiterId, tableId },
    include: [{ model: models.Table, as: "table" }],
  });
  if (!assignment || !assignment.table) {
    throw new Error("Assignment not found");
  }

  const table = assignment.table;
  const normalizedStatus = String(table.status || "").toLowerCase();
  if (normalizedStatus !== "enjoying" && normalizedStatus !== "paid") {
    throw new Error("Table not ready to complete");
  }

  // Update availability and THEN set status via the helper to trigger sockets
  await table.update({ isAvailable: true });
  await setTableStatus(tableId, "waiting");

  // Reset the assignment timestamp to "now" so that previous session foods are filtered out
  // but the waiter stays assigned to the table.
  assignment.setDataValue("createdAt", new Date());
  await assignment.save();

  return { success: true };
};
