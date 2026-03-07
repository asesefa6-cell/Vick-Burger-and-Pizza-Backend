import { models } from '../../db';
import { Role, RoleAttributes, RoleCreationAttributes } from './model';

export const createRole = async (payload: RoleCreationAttributes): Promise<Role> => {
  return await models.Role.create(payload);
};

export const findAllRoles = async (): Promise<Role[]> => {
  return await models.Role.findAll();
};

export const findRoleById = async (id: string): Promise<Role | null> => {
  return await models.Role.findByPk(id);
};

export const updateRole = async (
  id: string,
  updates: Partial<RoleAttributes>
): Promise<Role | null> => {
  const role = await models.Role.findByPk(id);
  if (!role) return null;
  return await role.update(updates);
};

export const deleteRole = async (id: string): Promise<boolean> => {
  const deletedCount = await models.Role.destroy({ where: { id } });
  return deletedCount > 0;
};
