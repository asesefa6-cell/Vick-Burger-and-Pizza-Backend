import { OpenAPIV3 } from 'openapi-types';

export const kitchenPaths: OpenAPIV3.PathsObject = {
  '/api/kitchen/orders/active': {
    get: {
      tags: ['Kitchen'],
      summary: 'Kitchen active orders',
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'tableId', in: 'query', required: false, schema: { type: 'string', format: 'uuid' } }],
      responses: { '200': { description: 'Active orders' } },
    },
  },
  '/api/kitchen/orders/{id}/status': {
    patch: {
      tags: ['Kitchen'],
      summary: 'Kitchen update order status',
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' } }, required: ['status'] } } } },
      responses: { '200': { description: 'Order status updated' } },
    },
  },
};
