import { OpenAPIV3 } from 'openapi-types';

export const reportPaths: OpenAPIV3.PathsObject = {
  '/reports/daily': {
    get: {
      tags: ['Reports'],
      summary: 'Daily sales report',
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'businessId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { '200': { description: 'Daily report' }, '403': { description: 'Forbidden' } },
    },
  },
  '/reports/weekly': {
    get: {
      tags: ['Reports'],
      summary: 'Weekly sales report',
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'businessId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { '200': { description: 'Weekly report' } },
    },
  },
  '/reports/monthly': {
    get: {
      tags: ['Reports'],
      summary: 'Monthly sales report',
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'businessId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { '200': { description: 'Monthly report' } },
    },
  },
  '/reports/order-status': {
    get: {
      tags: ['Reports'],
      summary: 'Order status summary',
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'businessId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { '200': { description: 'Order status report' } },
    },
  },
};
