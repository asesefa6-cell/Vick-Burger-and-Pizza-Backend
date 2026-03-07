import { models } from '../../db';
import { Payment, PaymentAttributes, PaymentCreationAttributes } from './model';

export const createPayment = async (payload: PaymentCreationAttributes): Promise<Payment> => {
  return await models.Payment.create(payload);
};

export const findAllPayments = async (): Promise<Payment[]> => {
  return await models.Payment.findAll();
};

export const findPaymentById = async (id: string): Promise<Payment | null> => {
  return await models.Payment.findByPk(id);
};

export const updatePayment = async (
  id: string,
  updates: Partial<PaymentAttributes>
): Promise<Payment | null> => {
  const payment = await models.Payment.findByPk(id);
  if (!payment) return null;
  return await payment.update(updates);
};

export const deletePayment = async (id: string): Promise<boolean> => {
  const deletedCount = await models.Payment.destroy({ where: { id } });
  return deletedCount > 0;
};
