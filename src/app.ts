import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { openapiSpec } from './docs';
import { models } from './db';

import userRoutes from './modules/user/routes';
import roleRoutes from './modules/role/routes';
import tableRoutes from './modules/table/routes';
import categoryRoutes from './modules/category/routes';
import menuItemRoutes from './modules/menuItem/routes';
import orderRoutes from './modules/order/routes';
import orderItemRoutes from './modules/orderItem/routes';
import paymentRoutes from './modules/payment/routes';
import reportRoutes from './modules/reporting/routes';
import reportsRoutes from './modules/reporting/reports.routes';
import kitchenRoutes from './modules/kitchen/routes';
import customerRoutes from './modules/customer/routes';
import waiterRoutes from './modules/waiter/routes';
import adminRoutes from './modules/admin/routes';
import superAdminRoutes from './modules/superAdmin/routes';
import authRoutes from './routes/authRoutes';
import fileRoutes from './modules/file/routes';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.get('/uploads/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid file id' });
      return;
    }
    const file = await models.File.findByPk(id);
    if (!file) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }
    const absPath = path.join(process.cwd(), 'uploads', file.filename);
    res.sendFile(absPath);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load file' });
  }
});
app.use(
  cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Optional request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/reports', reportsRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/waiter', waiterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/files', fileRoutes);
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get('/docs.json', (_req, res) => res.json(openapiSpec));

// Global error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof Error ? 500 : 500;
  const message = err instanceof Error ? err.message : 'Unexpected error';
  res.status(status).json({ success: false, message });
});

export default app;
