import { Router } from "express";
import Joi from "joi";
import {
  getActiveOrdersHandler,
  kitchenAnalyticsHandler,
  updateStatusHandler,
} from "./controller";
import { authenticate } from "../../middlewares/authMiddleware";
import { authorize } from "../../middlewares/roleMiddleware";
import { allowAllStaff } from "../_shared/rbac";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../_shared/validation";

// Example usage: app.use('/api/kitchen', kitchenRoutes);

const router = Router();
const uuid = Joi.string().guid({ version: "uuidv4" });

const statusSchema = Joi.object({
  status: Joi.string()
    .valid("Pending", "Preparing", "Ready", "Delivered")
    .required(),
});

const idParams = Joi.object({ id: uuid.required() });

const activeOrdersQuerySchema = Joi.object({
  tableId: uuid.optional(),
  status: Joi.string()
    .valid("Pending", "Preparing", "Ready", "Delivered")
    .optional(),
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional(),
});

router.get(
  "/orders/active",
  authenticate,
  authorize(allowAllStaff),
  validateQuery(activeOrdersQuerySchema),
  getActiveOrdersHandler,
);
router.get(
  "/analytics",
  authenticate,
  authorize(allowAllStaff),
  kitchenAnalyticsHandler,
);
router.patch(
  "/orders/:id/status",
  authenticate,
  authorize(allowAllStaff),
  validateParams(idParams),
  validateBody(statusSchema),
  updateStatusHandler,
);

export default router;
