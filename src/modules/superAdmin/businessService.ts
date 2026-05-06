import { Op } from "sequelize";
import { models, sequelize } from "../../db";
import {
  Business,
  BusinessAttributes,
  BusinessCreationAttributes,
} from "../../models/Business";
import { File } from "../../models/File";

export const createBusiness = async (
  payload: BusinessCreationAttributes,
): Promise<Business> => {
  const { chapaSecretKey, chapaPublicKey, ...rest } = payload as any;
  const business = await models.Business.create(rest);
  await models.PaymentMethod.create({
    businessId: business.id,
    name: "Cash",
    type: "manual",
    isActive: true,
  });
  if (chapaSecretKey) {
    await models.PaymentMethod.create({
      businessId: business.id,
      name: "Chapa",
      type: "chapa",
      isActive: true,
      chapaSecretKey,
      chapaPublicKey: chapaPublicKey ?? null,
    });
  }
  return business;
};

type ListQuery = {
  q?: string;
  businessId?: string;
  limit?: string | number;
  offset?: string | number;
  sortBy?: "businessName" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export const listBusinesses = async (
  query: ListQuery = {},
): Promise<Business[]> => {
  const where: any = {};

  if (query.businessId) {
    where.id = query.businessId;
  }

  if (query.q) {
    const q = query.q.trim();
    where[Op.or] = [
      { businessName: { [Op.iLike]: `%${q}%` } },
      { address: { [Op.iLike]: `%${q}%` } },
      { phone: { [Op.iLike]: `%${q}%` } },
    ];
  }

  const limit = query.limit ? Number(query.limit) : undefined;
  const offset = query.offset ? Number(query.offset) : undefined;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = (query.sortOrder || "desc").toUpperCase();

  return await models.Business.findAll({
    where,
    include: [{ model: File, as: "logoFile", required: false }],
    order: [[sortBy, sortOrder]],
    ...(limit ? { limit } : {}),
    ...(offset ? { offset } : {}),
  });
};

export const updateBusiness = async (
  id: string,
  updates: Partial<BusinessAttributes>,
): Promise<Business | null> => {
  const { chapaSecretKey, chapaPublicKey, ...rest } = updates as any;
  const business = await models.Business.findByPk(id);
  if (!business) return null;
  const updated = await business.update(rest);
  if (chapaSecretKey) {
    const existing = await models.PaymentMethod.findOne({
      where: { businessId: business.id, type: "chapa" },
    });
    if (existing) {
      await existing.update({
        name: "Chapa",
        isActive: true,
        chapaSecretKey,
        chapaPublicKey: chapaPublicKey ?? null,
      });
    } else {
      await models.PaymentMethod.create({
        businessId: business.id,
        name: "Chapa",
        type: "chapa",
        isActive: true,
        chapaSecretKey,
        chapaPublicKey: chapaPublicKey ?? null,
      });
    }
  }
  return updated;
};

export const deleteBusiness = async (id: string): Promise<boolean> => {
  const business = await models.Business.findByPk(id);
  if (!business) return false;

  await sequelize.transaction(async (transaction) => {
    // 1. Delete associated users (this will also soft-delete them if paranoid is on)
    await models.User.destroy({ where: { businessId: id }, transaction });

    // 2. Delete user-business mappings
    await models.UserBusiness.destroy({
      where: { businessId: id },
      transaction,
    });

    // 3. Delete categories and menu items
    await models.MenuItem.destroy({ where: { businessId: id }, transaction });
    await models.Category.destroy({ where: { businessId: id }, transaction });

    // 4. Delete payment methods
    await models.PaymentMethod.destroy({
      where: { businessId: id },
      transaction,
    });

    // 5. Handle Tables and their related data (Orders, Assignments, Ratings)
    const tables = await models.Table.findAll({
      where: { businessId: id },
      transaction,
    });
    const tableIds = tables.map((t) => t.id);

    if (tableIds.length > 0) {
      // Delete orders and their items/payments for these tables
      const orders = await models.Order.findAll({
        where: { tableId: tableIds },
        transaction,
      });
      const orderIds = orders.map((o) => o.id);

      if (orderIds.length > 0) {
        await models.OrderItem.destroy({
          where: { orderId: orderIds },
          transaction,
        });
        await models.Payment.destroy({
          where: { orderId: orderIds },
          transaction,
        });
        await models.Order.destroy({ where: { id: orderIds }, transaction });
      }

      await models.TableAssignment.destroy({
        where: { tableId: tableIds },
        transaction,
      });
      await models.TableRating.destroy({
        where: { tableId: tableIds },
        transaction,
      });
      await models.Table.destroy({ where: { id: tableIds }, transaction });
    }

    // 6. Finally delete the business
    await business.destroy({ transaction });
  });

  return true;
};
