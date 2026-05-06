import { Router } from "express";
import Joi from "joi";
import { authenticate } from "../../middlewares/authMiddleware";
import { authorize } from "../../middlewares/roleMiddleware";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../_shared/validation";
import {
  createBusinessHandler,
  updateBusinessHandler,
  deleteBusinessHandler,
  getBusinessesHandler,
} from "./businessController";
import {
  createUserHandler,
  deleteUserHandler,
  listUsersHandler,
  assignBusinessesHandler,
  updateUserHandler,
  listAssignmentsHandler,
  getUserBusinessesHandler,
  deleteAssignmentHandler,
} from "./userController";
import {
  consolidatedSalesHandler,
  recentActivityHandler,
  salesSeriesHandler,
  exportSalesHandler,
} from "./reportController";

// Example usage: app.use('/api/super-admin', superAdminRoutes);

const router = Router();
const uuid = Joi.string().guid({ version: "uuidv4" });

router.use(authenticate, authorize(["Super Admin"]));

const businessSchema = Joi.object({
  businessName: Joi.string().min(1).required(),
  address: Joi.string().min(1).required(),
  phone: Joi.string().min(1).required(),
  logoFileId: uuid.optional(),
  chapaSecretKey: Joi.string().min(1).optional(),
  chapaPublicKey: Joi.string().min(1).optional(),
  isActive: Joi.boolean().optional(),
});

const idParams = Joi.object({ id: uuid.required() });

router.post("/businesses", validateBody(businessSchema), createBusinessHandler);
const businessQuerySchema = Joi.object({
  q: Joi.string().min(1).optional(),
  businessId: uuid.optional(),
  limit: Joi.number().integer().min(1).max(5000).optional(),
  offset: Joi.number().integer().min(0).optional(),
  sortBy: Joi.string().valid("businessName", "createdAt").optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
});

router.get(
  "/businesses",
  validateQuery(businessQuerySchema),
  getBusinessesHandler,
);
router.put(
  "/businesses/:id",
  validateParams(idParams),
  validateBody(
    businessSchema.fork(Object.keys(businessSchema.describe().keys), (schema) =>
      schema.optional(),
    ),
  ),
  updateBusinessHandler,
);
router.delete(
  "/businesses/:id",
  validateParams(idParams),
  deleteBusinessHandler,
);

const userSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roleId: uuid.required(),
  businessId: uuid.optional(),
});

router.post("/users", validateBody(userSchema), createUserHandler);
router.get("/users", listUsersHandler);
router.put(
  "/users/:id",
  validateParams(idParams),
  validateBody(
    userSchema.fork(Object.keys(userSchema.describe().keys), (schema) =>
      schema.optional(),
    ),
  ),
  updateUserHandler,
);
router.delete("/users/:id", validateParams(idParams), deleteUserHandler);

const assignBusinessesSchema = Joi.object({
  businessIds: Joi.array().items(uuid).required(),
});

router.post(
  "/users/:id/businesses",
  validateParams(idParams),
  validateBody(assignBusinessesSchema),
  assignBusinessesHandler,
);
router.get(
  "/users/:id/businesses",
  validateParams(idParams),
  getUserBusinessesHandler,
);
router.get("/assignments", listAssignmentsHandler);
router.delete(
  "/assignments/:id",
  validateParams(idParams),
  deleteAssignmentHandler,
);

const reportQuerySchema = Joi.object({
  period: Joi.string().valid("daily", "weekly", "monthly").required(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  businessId: uuid.optional(),
  limit: Joi.number().integer().min(1).max(5000).optional(),
  offset: Joi.number().integer().min(0).optional(),
});

router.get(
  "/reports/sales",
  validateQuery(reportQuerySchema),
  consolidatedSalesHandler,
);
router.get(
  "/reports/sales-series",
  validateQuery(reportQuerySchema),
  salesSeriesHandler,
);
router.get("/reports/recent-activity", recentActivityHandler);
router.get(
  "/reports/sales/export",
  validateQuery(reportQuerySchema),
  exportSalesHandler,
);

export default router;
