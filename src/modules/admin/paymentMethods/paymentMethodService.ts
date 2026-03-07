import { models } from '../../../db';

export const listPaymentMethods = async (businessId: string) => {
  return await models.PaymentMethod.findAll({
    where: { businessId },
    order: [['createdAt', 'DESC']],
  });
};

export const createPaymentMethod = async (businessId: string, payload: { name: string; type?: string }) => {
  return await models.PaymentMethod.create({
    businessId,
    name: payload.name,
    type: payload.type ?? 'manual',
    isActive: true,
  });
};

export const updatePaymentMethod = async (
  businessId: string,
  id: string,
  updates: { name?: string; isActive?: boolean }
) => {
  const method = await models.PaymentMethod.findOne({ where: { id, businessId } });
  if (!method) return null;
  return await method.update({
    ...(updates.name ? { name: updates.name } : {}),
    ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {}),
  });
};

export const deletePaymentMethod = async (businessId: string, id: string): Promise<boolean> => {
  const deletedCount = await models.PaymentMethod.destroy({ where: { id, businessId } });
  return deletedCount > 0;
};
