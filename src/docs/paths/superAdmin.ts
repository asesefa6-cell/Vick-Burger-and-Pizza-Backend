import { OpenAPIV3 } from 'openapi-types';

export const superAdminPaths: OpenAPIV3.PathsObject = {
  '/api/super-admin/businesses': {
    get: { tags: ['SuperAdmin'], summary: 'List businesses', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Businesses fetched' } } },
    post: { tags: ['SuperAdmin'], summary: 'Create business', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { businessName: { type: 'string' }, address: { type: 'string' }, phone: { type: 'string' } }, required: ['businessName', 'address', 'phone'] } } } }, responses: { '201': { description: 'Business created' } } },
  },
  '/api/super-admin/businesses/{id}': {
    put: { tags: ['SuperAdmin'], summary: 'Update business', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Business updated' } } },
    delete: { tags: ['SuperAdmin'], summary: 'Delete business', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Business deleted' } } },
  },
  '/api/super-admin/users': {
    get: { tags: ['SuperAdmin'], summary: 'List users', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Users fetched' } } },
    post: { tags: ['SuperAdmin'], summary: 'Create user', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthRegisterRequest' } } } }, responses: { '201': { description: 'User created' } } },
  },
  '/api/super-admin/users/{id}': {
    delete: { tags: ['SuperAdmin'], summary: 'Delete user', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'User deleted' } } },
  },
  '/api/super-admin/reports/sales': {
    get: { tags: ['SuperAdmin'], summary: 'Consolidated sales report', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Consolidated report' } } },
  },
};
