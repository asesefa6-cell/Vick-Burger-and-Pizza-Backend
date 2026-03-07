import { models } from '../db';
import { User, UserCreationAttributes, UserAttributes } from '../models/User';

// Example usage:
// const user = await createUser({ name: 'Jane', email: 'jane@example.com', passwordHash: 'hash', roleId: 1 });

export const createUser = async (
  payload: UserCreationAttributes
): Promise<User> => {
  return await models.User.create(payload);
};

export const findAllUsers = async (): Promise<User[]> => {
  return await models.User.findAll();
};

export const findUserById = async (id: number): Promise<User | null> => {
  return await models.User.findByPk(id);
};

export const updateUser = async (
  id: number,
  updates: Partial<UserAttributes>
): Promise<User | null> => {
  const user = await models.User.findByPk(id);
  if (!user) return null;
  return await user.update(updates);
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const deletedCount = await models.User.destroy({ where: { id } });
  return deletedCount > 0;
};
