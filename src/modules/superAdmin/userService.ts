import bcrypt from 'bcrypt';
import { models } from '../../db';
import { User } from '../../models/User';

export const createUser = async (payload: {
  name: string;
  email: string;
  password: string;
  roleId: string;
  businessId?: string;
}): Promise<User> => {
  const existing = await models.User.findOne({ where: { email: payload.email } });
  if (existing) {
    throw new Error('Email already in use');
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  return await models.User.create({
    name: payload.name,
    email: payload.email,
    passwordHash,
    roleId: payload.roleId,
    businessId: payload.businessId ?? null,
  });
};

export const listUsers = async (): Promise<User[]> => {
  return await models.User.findAll();
};

export const updateUser = async (
  id: string,
  updates: { name?: string; email?: string; roleId?: string; businessId?: string | null }
): Promise<User | null> => {
  const user = await models.User.findByPk(id);
  if (!user) return null;
  return await user.update({
    ...(updates.name ? { name: updates.name } : {}),
    ...(updates.email ? { email: updates.email } : {}),
    ...(updates.roleId ? { roleId: updates.roleId } : {}),
    ...(updates.businessId !== undefined ? { businessId: updates.businessId } : {}),
  });
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const deletedCount = await models.User.destroy({ where: { id } });
  return deletedCount > 0;
};

export const assignBusinessesToUser = async (
  userId: string,
  businessIds: string[]
): Promise<void> => {
  await models.UserBusiness.destroy({ where: { userId } });
  if (businessIds.length === 0) return;
  const rows = businessIds.map((businessId) => ({ userId, businessId }));
  await models.UserBusiness.bulkCreate(rows);
};
