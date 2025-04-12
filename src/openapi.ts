import { OpenAPIV3 } from 'openapi-types';

export const apiSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'PerformAI API',
    version: '1.0.0',
    description: 'API documentation for PerformAI performance review system'
  },
  servers: [{
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    description: 'Production server'
  }],
  paths: {
    '/api/teams': {
      post: {
        summary: 'Create a new team',
        tags: ['Teams'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TeamCreate'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Team created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Team'
                }
              }
            }
          }
        }
      }
    }
    // ... more endpoints
  },
  components: {
    schemas: {
      TeamCreate: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' }
        }
      },
      Team: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          slug: { type: 'string' },
          plan_id: { type: 'string' },
          subscription_status: { 
            type: 'string',
            enum: ['active', 'inactive', 'past_due', 'canceled']
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      }
      // ... other schemas
    }
  }
}; 