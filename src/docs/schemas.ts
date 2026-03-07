import { OpenAPIV3 } from 'openapi-types';

export const schemas: OpenAPIV3.ComponentsObject['schemas'] = {
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
      tableId: { type: 'string', format: 'uuid' },
      tableNumber: { type: 'string' },
      qrCode: { type: 'string' },
      isActive: { type: 'boolean' },
      isAvailable: { type: 'boolean' },
      business: {
        type: 'object',
        properties: {
          businessId: { type: 'string', format: 'uuid' },
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
      itemId: { type: 'string', format: 'uuid' },
      itemName: { type: 'string' },
      description: { type: 'string', nullable: true },
      price: { type: 'string' },
      imageUrl: { type: 'string', nullable: true },
      availabilityStatus: { type: 'boolean' },
      categoryId: { type: 'string', format: 'uuid' },
      categoryName: { type: 'string' },
    },
  },
  MenuResponse: {
    type: 'object',
    properties: {
      businessId: { type: 'string', format: 'uuid' },
      categories: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            categoryId: { type: 'string', format: 'uuid' },
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
      tableId: { type: 'string', format: 'uuid' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          required: ['itemId', 'quantity'],
          properties: {
            itemId: { type: 'string', format: 'uuid' },
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
      orderId: { type: 'string', format: 'uuid' },
      paymentId: { type: 'string', format: 'uuid' },
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
      categoryId: { type: 'string', format: 'uuid' },
      businessId: { type: 'string', format: 'uuid' },
    },
  },
  AssignRoleRequest: {
    type: 'object',
    required: ['userId', 'roleId'],
    properties: {
      userId: { type: 'string', format: 'uuid' },
      roleId: { type: 'string', format: 'uuid' },
    },
  },
  AuthRegisterRequest: {
    type: 'object',
    required: ['name', 'email', 'password', 'roleId'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      password: { type: 'string' },
      roleId: { type: 'string', format: 'uuid' },
      businessId: { type: 'string', format: 'uuid' },
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
};
