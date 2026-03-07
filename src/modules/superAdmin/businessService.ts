import { Op } from 'sequelize';
import { models } from '../../db';
import { Business, BusinessAttributes, BusinessCreationAttributes } from '../../models/Business';
import { File } from '../../models/File';

export const createBusiness = async (payload: BusinessCreationAttributes): Promise<Business> => {
  const { chapaSecretKey, chapaPublicKey, ...rest } = payload as any;
  const business = await models.Business.create(rest);
  await models.PaymentMethod.create({
    businessId: business.id,
    name: 'Cash',
    type: 'manual',
    isActive: true,
  });
  if (chapaSecretKey) {
    await models.PaymentMethod.create({
      businessId: business.id,
      name: 'Chapa',
      type: 'chapa',
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
  sortBy?: 'businessName' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

export const listBusinesses = async (query: ListQuery = {}): Promise<Business[]> => {
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
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = (query.sortOrder || 'desc').toUpperCase();

  return await models.Business.findAll({
    where,
    include: [{ model: File, as: 'logoFile', required: false }],
    order: [[sortBy, sortOrder]],
    ...(limit ? { limit } : {}),
    ...(offset ? { offset } : {}),
  });
};

export const updateBusiness = async (
  id: number,
  updates: Partial<BusinessAttributes>
): Promise<Business | null> => {
  const { chapaSecretKey, chapaPublicKey, ...rest } = updates as any;
  const business = await models.Business.findByPk(id);
  if (!business) return null;
  const updated = await business.update(rest);
  if (chapaSecretKey) {
    const existing = await models.PaymentMethod.findOne({ where: { businessId: business.id, type: 'chapa' } });
    if (existing) {
      await existing.update({
        name: 'Chapa',
        isActive: true,
        chapaSecretKey,
        chapaPublicKey: chapaPublicKey ?? null,
      });
    } else {
      await models.PaymentMethod.create({
        businessId: business.id,
        name: 'Chapa',
        type: 'chapa',
        isActive: true,
        chapaSecretKey,
        chapaPublicKey: chapaPublicKey ?? null,
      });
    }
  }
  return updated;
};

export const deleteBusiness = async (id: number): Promise<boolean> => {
  const deletedCount = await models.Business.destroy({ where: { id } });
  return deletedCount > 0;
};
