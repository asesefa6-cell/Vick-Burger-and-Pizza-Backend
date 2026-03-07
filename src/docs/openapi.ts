import { OpenAPIV3 } from 'openapi-types';

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
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation error' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      CustomerTableInfo: {
        type: 'object',
        properties: {
          tableId: { type: 'integer' },
          tableNumber: { type: 'string' },
          qrCode: { type: 'string' },
          isActive: { type: 'boolean' },
          isAvailable: { type: 'boolean' },
          business: {
            type: 'object',
            properties: {
              businessId: { type: 'integer' },
              businessName: { type: 'string' },
              address: { type: 'string' },
              phone: { type: 'string' },
            },
          },
        },
      },
      MenuItem: {
        type: 'object',
        properties: {
          itemId: { type: 'integer' },
          itemName: { type: 'string' },
          description: { type: 'string', nullable: true },
          price: { type: 'string' },
          imageUrl: { type: 'string', nullable: true },
          availabilityStatus: { type: 'boolean' },
          categoryId: { type: 'integer' },
          categoryName: { type: 'string' },
        },
      },
      MenuResponse: {
        type: 'object',
        properties: {
          businessId: { type: 'integer' },
          categories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                categoryId: { type: 'integer' },
                categoryName: { type: 'string' },
                description: { type: 'string', nullable: true },
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MenuItem' },
                },
              },
            },
          },
        },
      },
      PlaceOrderRequest: {
        type: 'object',
        required: ['tableId', 'items'],
        properties: {
          tableId: { type: 'integer' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['itemId', 'quantity'],
              properties: {
                itemId: { type: 'integer' },
                quantity: { type: 'integer' },
                specialInstruction: { type: 'string' },
              },
            },
          },
        },
      },
      PaymentRequest: {
        type: 'object',
        required: ['provider', 'paymentMethod'],
        properties: {
          provider: { type: 'string', enum: ['Chapa', 'AddisPay', 'CardDemo'] },
          paymentMethod: { type: 'string' },
          transactionReference: { type: 'string' },
        },
      },
      Receipt: {
        type: 'object',
        properties: {
          receiptId: { type: 'string' },
          orderId: { type: 'integer' },
          paymentId: { type: 'integer' },
          amount: { type: 'string' },
          paymentDate: { type: 'string' },
          provider: { type: 'string' },
        },
      },
      AdminMenuItemRequest: {
        type: 'object',
        required: ['itemName', 'price', 'categoryId', 'businessId'],
        properties: {
          itemName: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'string' },
          imageUrl: { type: 'string' },
          availabilityStatus: { type: 'boolean' },
          categoryId: { type: 'integer' },
          businessId: { type: 'integer' },
        },
      },
      AssignRoleRequest: {
        type: 'object',
        required: ['userId', 'roleId'],
        properties: {
          userId: { type: 'integer' },
          roleId: { type: 'integer' },
        },
      },
      AuthRegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'roleId'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
          roleId: { type: 'integer' },
          businessId: { type: 'integer' },
        },
      },
      AuthLoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthRegisterRequest' } } },
        },
        responses: { '201': { description: 'User registered' }, '400': { description: 'Validation error' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthLoginRequest' } } },
        },
        responses: { '200': { description: 'Login successful' }, '401': { description: 'Unauthorized' } },
      },
    },
    '/api/customer/qr/{code}': {
      get: {
        summary: 'Customer QR scan / table identification',
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Table found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CustomerTableInfo' },
              },
            },
          },
          '404': { description: 'Table not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/customer/menu/{tableId}': {
      get: {
        summary: 'Fetch menu items for a table',
        parameters: [
          { name: 'tableId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          '200': {
            description: 'Menu fetched',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MenuResponse' } } },
          },
          '400': { description: 'Table not active', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '404': { description: 'Table not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/customer/orders': {
      post: {
        summary: 'Place order',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PlaceOrderRequest' } } },
        },
        responses: {
          '201': { description: 'Order placed' },
          '400': { description: 'Invalid order payload', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/customer/orders/{id}/pay': {
      post: {
        summary: 'Payment processing',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentRequest' } } },
        },
        responses: {
          '200': {
            description: 'Payment successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Receipt' } } },
          },
          '404': { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/kitchen/orders/active': {
      get: {
        summary: 'Kitchen active orders',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'tableId', in: 'query', required: false, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Active orders' } },
      },
    },
    '/api/kitchen/orders/{id}/status': {
      patch: {
        summary: 'Kitchen update order status',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' } } } } },
        },
        responses: { '200': { description: 'Order status updated' } },
      },
    },
    '/api/admin/menu-items': {
      post: {
        summary: 'Admin add menu item',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminMenuItemRequest' } } },
        },
        responses: {
          '201': { description: 'Menu item created' },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/admin/menu-items/{id}': {
      put: {
        summary: 'Admin update menu item',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminMenuItemRequest' } } },
        },
        responses: {
          '200': { description: 'Menu item updated' },
        },
      },
      delete: {
        summary: 'Admin delete menu item',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Menu item deleted' },
        },
      },
    },
    '/api/admin/roles/assign': {
      post: {
        summary: 'Admin role assignment',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignRoleRequest' } } },
        },
        responses: {
          '200': { description: 'Role assigned' },
        },
      },
    },
    '/api/admin/reports/sales': {
      get: {
        summary: 'Admin sales reports',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'period', in: 'query', required: true, schema: { type: 'string', enum: ['daily', 'weekly', 'monthly'] } },
          { name: 'startDate', in: 'query', required: false, schema: { type: 'string', format: 'date-time' } },
          { name: 'endDate', in: 'query', required: false, schema: { type: 'string', format: 'date-time' } },
        ],
        responses: {
          '200': { description: 'Sales report generated' },
        },
      },
    },
    '/reports/daily': {
      get: {
        summary: 'Daily sales report',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'businessId', in: 'query', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Daily report' }, '403': { description: 'Forbidden' } },
      },
    },
    '/reports/weekly': {
      get: {
        summary: 'Weekly sales report',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'businessId', in: 'query', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Weekly report' } },
      },
    },
    '/reports/monthly': {
      get: {
        summary: 'Monthly sales report',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'businessId', in: 'query', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Monthly report' } },
      },
    },
    '/reports/order-status': {
      get: {
        summary: 'Order status summary',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'businessId', in: 'query', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Order status report' } },
      },
    },
    '/api/users': {
      get: { summary: 'List users', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Users fetched' } } },
      post: {
        summary: 'Create user',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthRegisterRequest' } } } },
        responses: { '201': { description: 'User created' } },
      },
    },
    '/api/users/{id}': {
      get: { summary: 'Get user by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'User fetched' } } },
      put: { summary: 'Update user', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'User updated' } } },
      delete: { summary: 'Delete user', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'User deleted' } } },
    },
    '/api/roles': {
      get: { summary: 'List roles', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Roles fetched' } } },
      post: { summary: 'Create role', security: [{ BearerAuth: [] }], responses: { '201': { description: 'Role created' } } },
    },
    '/api/roles/{id}': {
      get: { summary: 'Get role by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Role fetched' } } },
      put: { summary: 'Update role', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Role updated' } } },
      delete: { summary: 'Delete role', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Role deleted' } } },
    },
    '/api/tables': {
      get: { summary: 'List tables', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Tables fetched' } } },
      post: { summary: 'Create table', security: [{ BearerAuth: [] }], responses: { '201': { description: 'Table created' } } },
    },
    '/api/tables/{id}': {
      get: { summary: 'Get table by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Table fetched' } } },
      put: { summary: 'Update table', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Table updated' } } },
      delete: { summary: 'Delete table', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Table deleted' } } },
    },
    '/api/categories': {
      get: { summary: 'List categories', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Categories fetched' } } },
      post: { summary: 'Create category', security: [{ BearerAuth: [] }], responses: { '201': { description: 'Category created' } } },
    },
    '/api/categories/{id}': {
      get: { summary: 'Get category by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Category fetched' } } },
      put: { summary: 'Update category', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Category updated' } } },
      delete: { summary: 'Delete category', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Category deleted' } } },
    },
    '/api/menu-items': {
      get: { summary: 'List menu items', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Menu items fetched' } } },
      post: { summary: 'Create menu item', security: [{ BearerAuth: [] }], responses: { '201': { description: 'Menu item created' } } },
    },
    '/api/menu-items/{id}': {
      get: { summary: 'Get menu item by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Menu item fetched' } } },
      put: { summary: 'Update menu item', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Menu item updated' } } },
      delete: { summary: 'Delete menu item', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Menu item deleted' } } },
    },
    '/api/order-items': {
      get: { summary: 'List order items', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Order items fetched' } } },
      post: { summary: 'Create order item', security: [{ BearerAuth: [] }], responses: { '201': { description: 'Order item created' } } },
    },
    '/api/order-items/{id}': {
      get: { summary: 'Get order item by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Order item fetched' } } },
      put: { summary: 'Update order item', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Order item updated' } } },
      delete: { summary: 'Delete order item', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Order item deleted' } } },
    },
    '/api/payments': {
      get: { summary: 'List payments', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Payments fetched' } } },
      post: { summary: 'Create payment', security: [{ BearerAuth: [] }], responses: { '201': { description: 'Payment created' } } },
    },
    '/api/payments/{id}': {
      get: { summary: 'Get payment by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Payment fetched' } } },
      put: { summary: 'Update payment', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Payment updated' } } },
      delete: { summary: 'Delete payment', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Payment deleted' } } },
    },
    '/api/reports/sales': { get: { summary: 'Sales report', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Sales report' } } } },
    '/api/reports/analytics': { get: { summary: 'Analytics report', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Analytics report' } } } },
    '/api/super-admin/businesses': { get: { summary: 'List businesses', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Businesses fetched' } } }, post: { summary: 'Create business', security: [{ BearerAuth: [] }], responses: { '201': { description: 'Business created' } } } },
    '/api/super-admin/businesses/{id}': { put: { summary: 'Update business', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Business updated' } } }, delete: { summary: 'Delete business', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Business deleted' } } } },
    '/api/super-admin/users': { get: { summary: 'List users', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Users fetched' } } }, post: { summary: 'Create user', security: [{ BearerAuth: [] }], responses: { '201': { description: 'User created' } } } },
    '/api/super-admin/users/{id}': { delete: { summary: 'Delete user', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'User deleted' } } } },
    '/api/super-admin/reports/sales': { get: { summary: 'Consolidated sales report', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Consolidated report' } } } }
  },
};
