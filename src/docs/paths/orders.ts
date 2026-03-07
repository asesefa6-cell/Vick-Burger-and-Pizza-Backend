import { OpenAPIV3 } from 'openapi-types';

export const orderPaths: OpenAPIV3.PathsObject = {
  '/api/orders': {
    get: { tags: ['Orders'], summary: 'List orders', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Orders fetched' } } },
  },
  '/api/orders/{id}': {
    get: { tags: ['Orders'], summary: 'Get order by id', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Order fetched' } } },
    put: { tags: ['Orders'], summary: 'Update order', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Order updated' } } },
    delete: { tags: ['Orders'], summary: 'Delete order', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Order deleted' } } },
  },
  '/api/orders/place': {
    post: {
      tags: ['Orders'],
      summary: 'Place order (customer)',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PlaceOrderRequest' } } } },
      responses: { '201': { description: 'Order placed' } },
    },
  },
  '/api/orders/{id}/pay': {
    post: {
      tags: ['Orders'],
      summary: 'Process order payment',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentRequest' } } } },
      responses: { '200': { description: 'Payment processed' } },
    },
  },
  '/api/orders/{id}/status': {
    patch: {
      tags: ['Orders'],
      summary: 'Update order status',
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' } }, required: ['status'] } } } },
      responses: { '200': { description: 'Order status updated' } },
    },
  },
};
