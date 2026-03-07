import { OpenAPIV3 } from 'openapi-types';

export const customerPaths: OpenAPIV3.PathsObject = {
  '/api/customer/qr/{code}': {
    get: {
      tags: ['Customer'],
      summary: 'Customer QR scan / table identification',
      parameters: [
        { name: 'code', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Table found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerTableInfo' } } },
        },
        '404': { description: 'Table not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
      },
    },
  },
  '/api/customer/menu/{tableId}': {
    get: {
      tags: ['Customer'],
      summary: 'Fetch menu items (with categories & availability)',
      parameters: [
        { name: 'tableId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
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
      tags: ['Customer'],
      summary: 'Place order (items + special instructions)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PlaceOrderRequest' },
            examples: {
              sample: {
                value: {
                  tableId: 'b3a8c0a6-6f5c-4d1e-8df5-6f6e2e1f4b0a',
                  items: [
                    { itemId: 'd2c2a1c1-9e9c-4b7d-9f2d-8a0ddf08a2d3', quantity: 2 },
                    { itemId: 'ac07b2f4-53a0-4d42-8e8a-9bfe1bd3a0d2', quantity: 1, specialInstruction: 'No onions' },
                  ],
                },
              },
            },
          },
        },
      },
      responses: {
        '201': { description: 'Order placed' },
        '400': { description: 'Invalid order payload', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
      },
    },
  },
  '/api/customer/orders/{id}/pay': {
    post: {
      tags: ['Customer'],
      summary: 'Payment processing',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PaymentRequest' },
            examples: {
              chapa: { value: { provider: 'Chapa', paymentMethod: 'Card', transactionReference: 'TXN-123' } },
              addispay: { value: { provider: 'AddisPay', paymentMethod: 'Wallet', transactionReference: 'ADD-456' } },
            },
          },
        },
      },
      responses: {
        '200': { description: 'Payment successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/Receipt' } } } },
        '404': { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
      },
    },
  },
};
