import { OpenAPIV3 } from 'openapi-types';

export const corePaths: OpenAPIV3.PathsObject = {
  '/api/users': {
    get: { tags: ['Users'], summary: 'List users', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Users fetched' } } },
    post: {
      tags: ['Users'],
      summary: 'Create user',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AuthRegisterRequest' },
            examples: { sample: { value: { name: 'Jane', email: 'jane@vekr.com', password: 'Pass1234', roleId: '7e98c0b5-1d2c-4f6a-8f1c-52b15e9e4f00' } } },
          },
        },
      },
      responses: { '201': { description: 'User created' } },
    },
  },
  '/api/users/{id}': {
    get: { tags: ['Users'], summary: 'Get user by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'User fetched' } } },
    put: { tags: ['Users'], summary: 'Update user', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'User updated' } } },
    delete: { tags: ['Users'], summary: 'Delete user', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'User deleted' } } },
  },
  '/api/roles': {
    get: { tags: ['Roles'], summary: 'List roles', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Roles fetched' } } },
    post: {
      tags: ['Roles'],
      summary: 'Create role',
      security: [{ BearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { roleName: { type: 'string' }, description: { type: 'string' } }, required: ['roleName'] } } } },
      responses: { '201': { description: 'Role created' } },
    },
  },
  '/api/roles/{id}': {
    get: { tags: ['Roles'], summary: 'Get role by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Role fetched' } } },
    put: { tags: ['Roles'], summary: 'Update role', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Role updated' } } },
    delete: { tags: ['Roles'], summary: 'Delete role', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Role deleted' } } },
  },
  '/api/tables': {
    get: { tags: ['Tables'], summary: 'List tables', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Tables fetched' } } },
    post: {
      tags: ['Tables'],
      summary: 'Create table',
      security: [{ BearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { tableNumber: { type: 'string' }, qrCode: { type: 'string' }, businessId: { type: 'string', format: 'uuid' }, isActive: { type: 'boolean' }, isAvailable: { type: 'boolean' } }, required: ['tableNumber', 'qrCode', 'businessId'] } } } },
      responses: { '201': { description: 'Table created' } },
    },
  },
  '/api/tables/{id}': {
    get: { tags: ['Tables'], summary: 'Get table by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Table fetched' } } },
    put: { tags: ['Tables'], summary: 'Update table', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Table updated' } } },
    delete: { tags: ['Tables'], summary: 'Delete table', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Table deleted' } } },
  },
  '/api/categories': {
    get: { tags: ['Categories'], summary: 'List categories', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Categories fetched' } } },
    post: {
      tags: ['Categories'],
      summary: 'Create category',
      security: [{ BearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { categoryName: { type: 'string' }, description: { type: 'string' }, businessId: { type: 'string', format: 'uuid' } }, required: ['categoryName', 'businessId'] } } } },
      responses: { '201': { description: 'Category created' } },
    },
  },
  '/api/categories/{id}': {
    get: { tags: ['Categories'], summary: 'Get category by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Category fetched' } } },
    put: { tags: ['Categories'], summary: 'Update category', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Category updated' } } },
    delete: { tags: ['Categories'], summary: 'Delete category', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Category deleted' } } },
  },
  '/api/menu-items': {
    get: { tags: ['MenuItems'], summary: 'List menu items', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Menu items fetched' } } },
    post: { tags: ['MenuItems'], summary: 'Create menu item', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminMenuItemRequest' } } } }, responses: { '201': { description: 'Menu item created' } } },
  },
  '/api/menu-items/{id}': {
    get: { tags: ['MenuItems'], summary: 'Get menu item by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Menu item fetched' } } },
    put: { tags: ['MenuItems'], summary: 'Update menu item', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Menu item updated' } } },
    delete: { tags: ['MenuItems'], summary: 'Delete menu item', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Menu item deleted' } } },
  },
  '/api/order-items': {
    get: { tags: ['OrderItems'], summary: 'List order items', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Order items fetched' } } },
    post: { tags: ['OrderItems'], summary: 'Create order item', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { orderId: { type: 'string', format: 'uuid' }, itemId: { type: 'string', format: 'uuid' }, quantity: { type: 'integer' }, specialInstruction: { type: 'string' } }, required: ['orderId', 'itemId', 'quantity'] } } } }, responses: { '201': { description: 'Order item created' } } },
  },
  '/api/order-items/{id}': {
    get: { tags: ['OrderItems'], summary: 'Get order item by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Order item fetched' } } },
    put: { tags: ['OrderItems'], summary: 'Update order item', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Order item updated' } } },
    delete: { tags: ['OrderItems'], summary: 'Delete order item', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Order item deleted' } } },
  },
  '/api/payments': {
    get: { tags: ['Payments'], summary: 'List payments', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Payments fetched' } } },
    post: { tags: ['Payments'], summary: 'Create payment', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { orderId: { type: 'string', format: 'uuid' }, paymentMethod: { type: 'string' }, paymentStatus: { type: 'string' }, transactionReference: { type: 'string' }, paymentDate: { type: 'string', format: 'date-time' } }, required: ['orderId', 'paymentMethod', 'paymentStatus'] } } } }, responses: { '201': { description: 'Payment created' } } },
  },
  '/api/payments/{id}': {
    get: { tags: ['Payments'], summary: 'Get payment by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Payment fetched' } } },
    put: { tags: ['Payments'], summary: 'Update payment', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Payment updated' } } },
    delete: { tags: ['Payments'], summary: 'Delete payment', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Payment deleted' } } },
  },
};
