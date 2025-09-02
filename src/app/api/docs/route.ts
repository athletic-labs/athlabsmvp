import { NextResponse } from 'next/server';
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Athletic Labs API',
      version: '1.0.0',
      description: 'Enterprise catering management platform API',
      contact: {
        name: 'Athletic Labs Support',
        email: 'support@athleticlabs.com',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            errors: { type: 'object' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            contactName: { type: 'string' },
            contactPhone: { type: 'string' },
            contactEmail: { type: 'string', format: 'email' },
            deliveryDate: { type: 'string', format: 'date' },
            deliveryTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
            deliveryAddress: { type: 'string' },
            estimatedGuests: { type: 'number', minimum: 10, maximum: 500 },
            status: { 
              type: 'string', 
              enum: ['draft', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] 
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['template', 'individual'] },
                  templateId: { type: 'string', format: 'uuid' },
                  menuItemId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'number', minimum: 1 },
                  panSize: { type: 'string', enum: ['half', 'full'] },
                },
              },
            },
          },
        },
        Team: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            city: { type: 'string' },
            leagueId: { type: 'string', format: 'uuid' },
            rosterSize: { type: 'number', minimum: 10, maximum: 200 },
            proteinTarget: { type: 'number', minimum: 0, maximum: 100 },
            carbsTarget: { type: 'number', minimum: 0, maximum: 100 },
            fatsTarget: { type: 'number', minimum: 0, maximum: 100 },
            billingEmail: { type: 'string', format: 'email' },
            taxRate: { type: 'number', minimum: 0, maximum: 1 },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/app/api/**/*.ts'],
};

const specs = swaggerJSDoc(options);

export async function GET() {
  return NextResponse.json(specs);
}