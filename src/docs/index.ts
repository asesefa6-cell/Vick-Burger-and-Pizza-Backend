import { OpenAPIV3 } from 'openapi-types';
import { schemas } from './schemas';
import { customerPaths } from './paths/customer';
import { authPaths } from './paths/auth';
import { adminPaths } from './paths/admin';
import { reportPaths } from './paths/reports';
import { corePaths } from './paths/core';
import { orderPaths } from './paths/orders';
import { kitchenPaths } from './paths/kitchen';
import { reportingPaths } from './paths/reporting';
import { superAdminPaths } from './paths/superAdmin';

export const openapiSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Vekr Burger & Pizza API',
    version: '1.0.0',
    description: 'Backend API for QR-based ordering and payments',
  },
  servers: [{ url: 'http://localhost:5000' }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: schemas || {},
  },
  tags: [
    { name: 'Auth' },
    { name: 'Customer' },
    { name: 'Admin' },
    { name: 'Reports' },
    { name: 'Users' },
    { name: 'Roles' },
    { name: 'Tables' },
    { name: 'Categories' },
    { name: 'MenuItems' },
    { name: 'OrderItems' },
    { name: 'Payments' },
    { name: 'Orders' },
    { name: 'Kitchen' },
    { name: 'Reporting' },
    { name: 'SuperAdmin' },
  ],
  security: [{ BearerAuth: [] }],
  paths: {
    ...authPaths,
    ...customerPaths,
    ...adminPaths,
    ...reportPaths,
    ...corePaths,
    ...orderPaths,
    ...kitchenPaths,
    ...reportingPaths,
    ...superAdminPaths,
  },
};
