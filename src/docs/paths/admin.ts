import { OpenAPIV3 } from 'openapi-types';

export const adminPaths: OpenAPIV3.PathsObject = {
  '/api/admin/menu-items': {
    post: {
      tags: ['Admin'],
      summary: 'Admin add menu item',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AdminMenuItemRequest' },
            examples: {
              sample: {
                value: {
                  itemName: 'Classic Burger',
                  description: 'Beef patty with cheese',
                  price: '8.99',
                  categoryId: '2b9b6e1b-3c3c-49a4-8b3b-9b3b7f2e4d1a',
                  businessId: '1c7b8a14-2d7b-4b7d-9c7c-2b77edc8b2c3',
                  availabilityStatus: true,
                },
              },
            },
          },
        },
      },
      responses: { '201': { description: 'Menu item created' }, '400': { description: 'Validation error' } },
    },
  },
  '/api/admin/menu-items/{id}': {
    put: {
      tags: ['Admin'],
      summary: 'Admin update menu item',
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminMenuItemRequest' } } } },
      responses: { '200': { description: 'Menu item updated' } },
    },
    delete: {
      tags: ['Admin'],
      summary: 'Admin delete menu item',
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { '200': { description: 'Menu item deleted' } },
    },
  },
  '/api/admin/reports/sales': {
    get: {
      tags: ['Admin'],
      summary: 'Admin sales reports',
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: 'period', in: 'query', required: true, schema: { type: 'string', enum: ['daily', 'weekly', 'monthly'] } },
        { name: 'startDate', in: 'query', required: false, schema: { type: 'string', format: 'date-time' } },
        { name: 'endDate', in: 'query', required: false, schema: { type: 'string', format: 'date-time' } },
      ],
      responses: { '200': { description: 'Sales report generated' } },
    },
  },
  '/api/admin/roles/assign': {
    post: {
      tags: ['Admin'],
      summary: 'Admin role assignment',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AssignRoleRequest' },
            examples: { sample: { value: { userId: 'a8c1...', roleId: 'b2d3...' } } },
          },
        },
      },
      responses: { '200': { description: 'Role assigned' } },
    },
  },
};
