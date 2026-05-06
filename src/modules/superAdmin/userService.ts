import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { models } from "../../db";
import { User } from "../../models/User";

export const createUser = async (payload: {
  name: string;
  email: string;
  password: string;
  roleId: string;
  businessId?: string;
}): Promise<User> => {
  const existing = await models.User.findOne({
    where: { email: payload.email },
  });
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const user = await models.User.create({
    name: payload.name,
    email: payload.email,
    passwordHash,
    roleId: payload.roleId,
    businessId: payload.businessId ?? null,
  });

  if (payload.businessId) {
    await models.UserBusiness.create({
      userId: user.id,
      businessId: payload.businessId,
    });
  }

  return user;
};

export const listUsers = async (): Promise<User[]> => {
  return await models.User.findAll();
};

export const updateUser = async (
  id: string,
  updates: {
    name?: string;
    email?: string;
    roleId?: string;
    businessId?: string | null;
  },
): Promise<User | null> => {
  const user = await models.User.findByPk(id);
  if (!user) return null;
  return await user.update({
    ...(updates.name ? { name: updates.name } : {}),
    ...(updates.email ? { email: updates.email } : {}),
    ...(updates.roleId ? { roleId: updates.roleId } : {}),
    ...(updates.businessId !== undefined
      ? { businessId: updates.businessId }
      : {}),
  });
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const deletedCount = await models.User.destroy({ where: { id } });
  return deletedCount > 0;
};

export const assignBusinessesToUser = async (
  userId: string,
  businessIds: string[],
): Promise<void> => {
  if (businessIds.length === 0) return;

  for (const businessId of businessIds) {
    // Ensure business is not assigned to someone else
    const other = await models.UserBusiness.findOne({
      where: { businessId, userId: { [Op.ne]: userId } },
    });
    if (other) {
      const biz = await models.Business.findByPk(businessId);
      throw new Error(
        `Business "${biz?.businessName || businessId}" is already assigned to another user`,
      );
    }

    const existing = await models.UserBusiness.findOne({
      where: { userId, businessId },
      paranoid: false,
    });

    if (existing) {
      if (existing.deletedAt) {
        await existing.restore();
      }
    } else {
      await models.UserBusiness.create({ userId, businessId });
    }
  }
};

export const listAssignments = async (params: {
  q?: string;
  limit: number;
  offset: number;
}) => {
  const where: any = {};
  if (params.q) {
    where[Op.or] = [
      { "$business.businessName$": { [Op.iLike]: `%${params.q}%` } },
      { "$user.name$": { [Op.iLike]: `%${params.q}%` } },
      { "$user.email$": { [Op.iLike]: `%${params.q}%` } },
    ];
  }
  const { rows, count } = await models.UserBusiness.findAndCountAll({
    where,
    include: [
      {
        model: models.Business,
        as: "business",
        attributes: ["id", "businessName"],
      },
      { model: models.User, as: "user", attributes: ["id", "name", "email"] },
    ],
    limit: params.limit,
    offset: params.offset,
    order: [["createdAt", "DESC"]],
  });
  return { rows, count };
};
