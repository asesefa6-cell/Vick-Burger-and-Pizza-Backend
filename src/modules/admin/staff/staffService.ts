import bcrypt from 'bcrypt';
import { models } from '../../../db';
import { fn, col } from 'sequelize';
import { User } from '../../../models/User';
import { Role } from '../../../models/Role';

const staffRoles = ['Manager', 'Chef', 'Waiter'];
const managerRoleName = 'Manager';

export const listStaffUsers = async (
  businessId: string,
  options?: { excludeManager?: boolean }
): Promise<User[]> => {
  const roles = options?.excludeManager ? staffRoles.filter((r) => r !== managerRoleName) : staffRoles;
  const users = await models.User.findAll({
    where: { businessId },
    include: [{ model: Role, as: 'role', where: { roleName: roles }, required: true }],
  });
  const ratings = await models.TableRating.findAll({
    where: { businessId },
    attributes: ['waiterId', [fn('AVG', col('rating')), 'avgRating']],
    group: ['waiterId'],
  });
  const ratingMap = new Map<string, number>(
    ratings.map((r: any) => [r.waiterId as string, Number(r.get('avgRating'))])
  );
  return users.map((u: any) => {
    u.setDataValue('avgRating', ratingMap.get(u.id) ?? null);
    return u;
  });
};

export const createStaffUser = async (payload: {
  name: string;
  email: string;
  password: string;
  roleId: string;
  businessId: string;
  actorRole?: string | null;
}): Promise<User> => {
  const existing = await models.User.findOne({ where: { email: payload.email } });
  if (existing) {
    throw new Error('Email already in use');
  }

  const role = await models.Role.findByPk(payload.roleId);
  if (!role || !staffRoles.includes(role.roleName)) {
    throw new Error('Invalid role for staff');
  }
  if (payload.actorRole === managerRoleName && role.roleName === managerRoleName) {
    throw new Error('Managers cannot create managers');
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  return await models.User.create({
    name: payload.name,
    email: payload.email,
    passwordHash,
    roleId: payload.roleId,
    businessId: payload.businessId,
  });
};

export const updateStaffUser = async (
  id: string,
  businessId: string,
  updates: { name?: string; email?: string; roleId?: string },
  actorRole?: string | null
): Promise<User | null> => {
  const user = await models.User.findOne({ where: { id, businessId }, include: [{ model: Role, as: 'role' }] });
  if (!user) return null;
  const currentRoleName = user.role?.roleName;

  if (updates.roleId) {
    const role = await models.Role.findByPk(updates.roleId);
    if (!role || !staffRoles.includes(role.roleName)) {
      throw new Error('Invalid role for staff');
    }
    if (actorRole === managerRoleName && role.roleName === managerRoleName) {
      throw new Error('Managers cannot assign manager role');
    }
  }
  if (actorRole === managerRoleName && currentRoleName === managerRoleName) {
    throw new Error('Managers cannot update managers');
  }

  return await user.update({
    ...(updates.name ? { name: updates.name } : {}),
    ...(updates.email ? { email: updates.email } : {}),
    ...(updates.roleId ? { roleId: updates.roleId } : {}),
  });
};

export const deleteStaffUser = async (
  id: string,
  businessId: string,
  actorRole?: string | null
): Promise<boolean> => {
  if (actorRole === managerRoleName) {
    const target = await models.User.findOne({ where: { id, businessId }, include: [{ model: Role, as: 'role' }] });
    if (!target) return false;
    if (target.role?.roleName === managerRoleName) {
      throw new Error('Managers cannot delete managers');
    }
  }
  const deletedCount = await models.User.destroy({ where: { id, businessId } });
  return deletedCount > 0;
};
