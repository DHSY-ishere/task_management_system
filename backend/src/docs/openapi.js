const taskExample = {
  id: '3f0c7c1e-8a3b-4a52-9f7e-0c6a1d2b9e11',
  title: 'Complete assignment',
  description: 'Build the full-stack task manager',
  status: 'pending',
  priority: 'high',
  dueDate: '2026-10-05',
  createdAt: '2026-10-01T09:00:00.000Z',
  updatedAt: '2026-10-01T09:00:00.000Z',
};

const errorResponse = (description, example) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example } },
});

const notFound = errorResponse('Task not found', {
  success: false,
  message: 'Task with id "abc" not found',
});

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  description: 'Task id',
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description: 'REST API for the Task Management System. Data is stored in memory and resets on restart.',
  },
  servers: [{ url: 'http://localhost:5000', description: 'Local development' }],
  tags: [{ name: 'Tasks' }],
  paths: {
    '/api/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Get all tasks',
        description: 'Supports search, filtering, sorting and pagination.',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Match title or description' },
          { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/Status' } },
          { name: 'priority', in: 'query', schema: { $ref: '#/components/schemas/Priority' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['createdAt', 'dueDate', 'priority', 'title'], default: 'createdAt' },
          },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          200: {
            description: 'List of tasks',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    meta: { $ref: '#/components/schemas/PageMeta' },
                  },
                },
              },
            },
          },
          400: errorResponse('Invalid query parameters', {
            success: false,
            message: 'Invalid query parameters',
            errors: { status: 'Status must be one of: pending, in_progress, completed' },
          }),
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a task',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskInput' },
              example: {
                title: 'Complete assignment',
                description: 'Build the full-stack task manager',
                status: 'pending',
                priority: 'high',
                dueDate: '2026-10-05',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Task created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          400: errorResponse('Validation failed', {
            success: false,
            message: 'Validation failed',
            errors: { title: 'Title is required' },
          }),
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get a single task',
        parameters: [idParam],
        responses: {
          200: {
            description: 'The task',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          404: notFound,
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Update a task',
        description: 'Only the supplied fields are changed. Provide at least one field.',
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskInput' },
              example: { status: 'completed', priority: 'medium' },
            },
          },
        },
        responses: {
          200: {
            description: 'Task updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          400: errorResponse('Validation failed', {
            success: false,
            message: 'Validation failed',
            errors: { status: 'Status must be one of: pending, in_progress, completed' },
          }),
          404: notFound,
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        parameters: [idParam],
        responses: {
          200: {
            description: 'Task deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task deleted successfully' },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          404: notFound,
        },
      },
    },
  },
  components: {
    schemas: {
      Status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
      Priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', maxLength: 100 },
          description: { type: 'string', maxLength: 1000 },
          status: { $ref: '#/components/schemas/Status' },
          priority: { $ref: '#/components/schemas/Priority' },
          dueDate: { type: 'string', format: 'date', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        example: taskExample,
      },
      TaskInput: {
        type: 'object',
        required: ['title', 'description'],
        description: 'title and description are required on create. status defaults to pending, priority to medium.',
        properties: {
          title: { type: 'string', maxLength: 100 },
          description: { type: 'string', maxLength: 1000 },
          status: { $ref: '#/components/schemas/Status' },
          priority: { $ref: '#/components/schemas/Priority' },
          dueDate: { type: 'string', format: 'date', nullable: true, example: '2026-10-05' },
        },
      },
      PageMeta: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 24 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 3 },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'object', additionalProperties: { type: 'string' } },
        },
      },
    },
  },
};
