import { models } from '../../../db';
import { fn, col } from 'sequelize';

export const listAssignments = async (businessId: string) => {
  const rows = await models.TableAssignment.findAll({
    include: [
      {
        model: models.Table,
        as: 'table',
        required: true,
        where: { businessId },
      },
      {
        model: models.User,
        as: 'waiter',
        include: [{ model: models.Role, as: 'role' }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  const ratings = await models.TableRating.findAll({
    where: { businessId },
    attributes: ['waiterId', [fn('AVG', col('rating')), 'avgRating']],
    group: ['waiterId'],
  });
  const ratingMap = new Map<string, number>(
    ratings.map((r: any) => [r.waiterId as string, Number(r.get('avgRating'))])
  );
  return rows.map((row: any) => {
    if (row.waiter) {
      row.waiter.setDataValue('avgRating', ratingMap.get(row.waiter.id) ?? null);
    }
    return row;
  });
};

export const assignTableToWaiter = async (
  businessId: string,
  tableId: string,
  waiterId: string,
  assignedBy?: string | null
) => {
  const table = await models.Table.findOne({ where: { id: tableId, businessId } });
  if (!table) {
    throw new Error('Table not found');
  }

  const waiter = await models.User.findOne({
    where: { id: waiterId, businessId },
    include: [{ model: models.Role, as: 'role' }],
  });
  if (!waiter || waiter.role?.roleName !== 'Waiter') {
    throw new Error('Waiter not found');
  }

  const existing = await models.TableAssignment.findOne({ where: { tableId } });
  if (existing) {
    return await existing.update({
      waiterId,
      assignedBy: assignedBy ?? null,
    });
  }

  return await models.TableAssignment.create({
    tableId,
    waiterId,
    assignedBy: assignedBy ?? null,
  });
};

export const unassignTable = async (businessId: string, tableId: string): Promise<boolean> => {
  const table = await models.Table.findOne({ where: { id: tableId, businessId } });
  if (!table) {
    throw new Error('Table not found');
  }
  const deletedCount = await models.TableAssignment.destroy({ where: { tableId } });
  return deletedCount > 0;
};
