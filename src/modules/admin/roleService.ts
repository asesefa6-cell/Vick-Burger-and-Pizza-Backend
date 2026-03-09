import { models } from '../../db';
import { User } from '../../models/User';

export const assignRoleToUser = async (userId: string, roleId: string): Promise<User | null> => {
  const user = await models.User.findByPk(userId);
  if (!user) return null;
  return await user.update({ roleId });
};
