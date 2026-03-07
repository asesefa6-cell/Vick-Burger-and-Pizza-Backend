import { OpenAPIV3 } from 'openapi-types';

export const authPaths: OpenAPIV3.PathsObject = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AuthRegisterRequest' },
            examples: {
              admin: {
                value: {
                  name: 'Admin User',
                  email: 'admin@vekr.com',
                  password: 'StrongPass123',
                  roleId: '7e98c0b5-1d2c-4f6a-8f1c-52b15e9e4f00',
                  businessId: '1c7b8a14-2d7b-4b7d-9c7c-2b77edc8b2c3',
                },
              },
            },
          },
        },
      },
      responses: { '201': { description: 'User registered' }, '400': { description: 'Validation error' } },
    },
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AuthLoginRequest' },
            examples: { sample: { value: { email: 'admin@vekr.com', password: 'StrongPass123' } } },
          },
        },
      },
      responses: { '200': { description: 'Login successful' }, '401': { description: 'Unauthorized' } },
    },
  },
};
