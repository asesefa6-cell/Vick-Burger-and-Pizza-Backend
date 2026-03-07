import { OpenAPIV3 } from 'openapi-types';

export const reportingPaths: OpenAPIV3.PathsObject = {
  '/api/reports/sales': { get: { tags: ['Reporting'], summary: 'Sales report', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Sales report' } } } },
  '/api/reports/analytics': { get: { tags: ['Reporting'], summary: 'Analytics report', security: [{ BearerAuth: [] }], responses: { '200': { description: 'Analytics report' } } } },
};
