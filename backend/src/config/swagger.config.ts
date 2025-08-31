/**
 * Swagger/OpenAPI configuration for API documentation
 */
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'BookReview Platform API',
    version: '1.0.0',
    description: 'API for the BookReview platform',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'BookReview Team',
      url: 'https://bookreview.example.com',
      email: 'support@bookreview.example.com',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'jwt',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
          },
          data: {
            type: 'null',
            example: null,
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'number',
                example: 400,
              },
              message: {
                type: 'string',
                example: 'Error message',
              },
              details: {
                type: 'object',
                example: {
                  field: 'Error details',
                },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          email: {
            type: 'string',
            example: 'user@example.com',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
        },
      },
      Book: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174001',
          },
          title: {
            type: 'string',
            example: 'The Great Gatsby',
          },
          author: {
            type: 'string',
            example: 'F. Scott Fitzgerald',
          },
          description: {
            type: 'string',
            example: 'A novel about the American Dream...',
          },
          coverImage: {
            type: 'string',
            example: 'https://example.com/covers/great-gatsby.jpg',
          },
          genres: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['Fiction', 'Classic'],
          },
          publishedYear: {
            type: 'number',
            example: 1925,
          },
          averageRating: {
            type: 'number',
            example: 4.5,
          },
          reviewCount: {
            type: 'number',
            example: 120,
          },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174002',
          },
          bookId: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174001',
          },
          userId: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          text: {
            type: 'string',
            example: 'This book was amazing...',
          },
          rating: {
            type: 'number',
            example: 5,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['https://example.com/reviews/image1.jpg'],
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          currentPage: {
            type: 'number',
            example: 1,
          },
          pageSize: {
            type: 'number',
            example: 10,
          },
          totalItems: {
            type: 'number',
            example: 100,
          },
          totalPages: {
            type: 'number',
            example: 10,
          },
          hasNextPage: {
            type: 'boolean',
            example: true,
          },
          hasPrevPage: {
            type: 'boolean',
            example: false,
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication is required to access the resource',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'error',
              data: null,
              error: {
                code: 401,
                message: 'Authentication required',
              },
            },
          },
        },
      },
      ForbiddenError: {
        description: 'User does not have permission to access the resource',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'error',
              data: null,
              error: {
                code: 403,
                message: 'Permission denied',
              },
            },
          },
        },
      },
      NotFoundError: {
        description: 'The requested resource was not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'error',
              data: null,
              error: {
                code: 404,
                message: 'Resource not found',
              },
            },
          },
        },
      },
      ValidationError: {
        description: 'The request contains invalid data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'error',
              data: null,
              error: {
                code: 422,
                message: 'Validation failed',
                details: {
                  email: 'Must be a valid email',
                  password: 'Must be at least 8 characters',
                },
              },
            },
          },
        },
      },
      ServerError: {
        description: 'An internal server error occurred',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'error',
              data: null,
              error: {
                code: 500,
                message: 'Internal server error',
              },
            },
          },
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Path to the API routes files
};

export const swaggerSpec = swaggerJsdoc(options);
