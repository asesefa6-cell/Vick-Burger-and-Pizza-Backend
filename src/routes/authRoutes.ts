import { Router } from 'express';
import Joi from 'joi';
import { registerHandler, loginHandler, meHandler, updateMeHandler } from '../controllers/authController';
import { validateBody } from '../modules/_shared/validation';
import { authenticate } from '../middlewares/authMiddleware';

// Example usage: app.use('/auth', authRoutes);

const router = Router();
const uuid = Joi.string().guid({ version: 'uuidv4' });

const registerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roleId: uuid.required(),
  businessId: uuid.optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const updateMeSchema = Joi.object({
  name: Joi.string().min(1).optional(),
  profileFileId: uuid.allow(null).optional(),
});

router.post('/register', validateBody(registerSchema), registerHandler);
router.post('/login', validateBody(loginSchema), loginHandler);
router.get('/me', authenticate, meHandler);
router.put('/me', authenticate, validateBody(updateMeSchema), updateMeHandler);

export default router;
