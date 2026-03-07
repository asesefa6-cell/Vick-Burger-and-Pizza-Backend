import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../../middlewares/authMiddleware';
import { authorize } from '../../middlewares/roleMiddleware';
import { allowAdminAndSuperAdmin, allowAdminManagerAndSuperAdmin } from '../_shared/rbac';
import { validateBody, validateParams } from '../_shared/validation';
import {
  createMenuItemHandler,
  updateMenuItemHandler,
  deleteMenuItemHandler,
  getMenuItemsByBusinessHandler,
} from './menuController';
import {
  getOrdersByTableHandler,
  getOrdersByBusinessHandler,
  updateOrderStatusHandler,
} from './orderController';
import { assignRoleHandler } from './roleController';
import { salesReportHandler } from '../reporting/controller';
import { createStaffHandler, deleteStaffHandler, listStaffHandler, updateStaffHandler } from './staff/staffController';
import { bulkCreateTablesHandler, createTableHandler, deleteTableHandler, listTablesHandler, updateTableHandler } from './tables/tableController';
import { assignTableHandler, listAssignmentsHandler, unassignTableHandler } from './tableAssignments/tableAssignmentController';
import { createPaymentMethodHandler, deletePaymentMethodHandler, listPaymentMethodsHandler, updatePaymentMethodHandler } from './paymentMethods/paymentMethodController';

// Example usage: app.use('/api/admin', adminRoutes);

const router = Router();
const uuid = Joi.string().guid({ version: 'uuidv4' });

const menuCreateSchema = Joi.object({
  itemName: Joi.string().min(1).required(),
  description: Joi.string().optional(),
  price: Joi.string().min(1).required(),
  imageUrl: Joi.string().min(1).optional(),
  availabilityStatus: Joi.boolean().optional(),
  itemType: Joi.string().min(1).optional(),
  directToWaiter: Joi.boolean().optional(),
  categoryId: uuid.required(),
  businessId: uuid.required(),
});

const menuUpdateSchema = menuCreateSchema.fork(Object.keys(menuCreateSchema.describe().keys), (schema) => schema.optional());

const statusSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Preparing', 'Ready', 'Delivered').required(),
});

const assignRoleSchema = Joi.object({
  userId: uuid.required(),
  roleId: uuid.required(),
});

const idParams = Joi.object({ id: uuid.required() });
const tableParams = Joi.object({ tableId: uuid.required() });
const businessParams = Joi.object({ businessId: uuid.required() });

router.post('/menu-items', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateBody(menuCreateSchema), createMenuItemHandler);
router.put('/menu-items/:id', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(idParams), validateBody(menuUpdateSchema), updateMenuItemHandler);
router.delete('/menu-items/:id', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(idParams), deleteMenuItemHandler);

router.get('/menu-items/business/:businessId', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(businessParams), getMenuItemsByBusinessHandler);

router.get('/orders/table/:tableId', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(tableParams), getOrdersByTableHandler);
router.get('/orders/business/:businessId', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(businessParams), getOrdersByBusinessHandler);
router.patch('/orders/:id/status', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(idParams), validateBody(statusSchema), updateOrderStatusHandler);

router.get('/reports/sales', authenticate, authorize(allowAdminManagerAndSuperAdmin), salesReportHandler);

router.post('/roles/assign', authenticate, authorize(allowAdminAndSuperAdmin), validateBody(assignRoleSchema), assignRoleHandler);

const staffSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roleId: uuid.required(),
});
const staffUpdateSchema = staffSchema.fork(Object.keys(staffSchema.describe().keys), (schema) => schema.optional());

router.get('/staff', authenticate, authorize(allowAdminManagerAndSuperAdmin), listStaffHandler);
router.post('/staff', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateBody(staffSchema), createStaffHandler);
router.put('/staff/:id', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(idParams), validateBody(staffUpdateSchema), updateStaffHandler);
router.delete('/staff/:id', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(idParams), deleteStaffHandler);

const tableSchema = Joi.object({
  tableNumber: Joi.string().min(1).required(),
  isActive: Joi.boolean().optional(),
  isAvailable: Joi.boolean().optional(),
});
const tableUpdateSchema = tableSchema.fork(Object.keys(tableSchema.describe().keys), (schema) => schema.optional());

router.get('/tables', authenticate, authorize(allowAdminManagerAndSuperAdmin), listTablesHandler);
router.post('/tables', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateBody(tableSchema), createTableHandler);
router.put('/tables/:id', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(idParams), validateBody(tableUpdateSchema), updateTableHandler);
router.delete('/tables/:id', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(idParams), deleteTableHandler);

const tableBulkSchema = Joi.object({
  count: Joi.number().integer().min(1).max(200).required(),
  prefix: Joi.string().min(1).optional(),
});
router.post('/tables/bulk', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateBody(tableBulkSchema), bulkCreateTablesHandler);

const paymentMethodSchema = Joi.object({
  name: Joi.string().min(1).required(),
  type: Joi.string().min(1).optional(),
});
const paymentMethodUpdateSchema = paymentMethodSchema.fork(Object.keys(paymentMethodSchema.describe().keys), (schema) => schema.optional());

router.get('/payment-methods', authenticate, authorize(allowAdminManagerAndSuperAdmin), listPaymentMethodsHandler);
router.post('/payment-methods', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateBody(paymentMethodSchema), createPaymentMethodHandler);
router.put('/payment-methods/:id', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(idParams), validateBody(paymentMethodUpdateSchema), updatePaymentMethodHandler);
router.delete('/payment-methods/:id', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(idParams), deletePaymentMethodHandler);

const tableAssignSchema = Joi.object({
  tableId: uuid.required(),
  waiterId: uuid.required(),
});
const tableAssignParams = Joi.object({ tableId: uuid.required() });

router.get('/table-assignments', authenticate, authorize(allowAdminManagerAndSuperAdmin), listAssignmentsHandler);
router.post('/table-assignments', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateBody(tableAssignSchema), assignTableHandler);
router.delete('/table-assignments/:tableId', authenticate, authorize(allowAdminManagerAndSuperAdmin), validateParams(tableAssignParams), unassignTableHandler);

export default router;
