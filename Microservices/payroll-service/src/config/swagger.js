const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HRMS API',
      version: '1.0.0',
      description: 'A comprehensive Human Resource Management System API',
      contact: {
        name: 'HRMS Team',
        email: 'support@hrms.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Employee: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the employee'
            },
            employeeId: {
              type: 'string',
              description: 'Employee ID'
            },
            firstName: {
              type: 'string',
              description: 'First name of the employee'
            },
            lastName: {
              type: 'string',
              description: 'Last name of the employee'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the employee'
            },
            phone: {
              type: 'string',
              description: 'Phone number of the employee'
            },
            address: {
              type: 'string',
              description: 'Address of the employee'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'Date of birth of the employee'
            },
            hireDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date when the employee was hired'
            },
            salary: {
              type: 'number',
              description: 'Salary of the employee'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the employee is active'
            }
          }
        },
        Department: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the department'
            },
            name: {
              type: 'string',
              description: 'Name of the department'
            },
            description: {
              type: 'string',
              description: 'Description of the department'
            }
          }
        },
        Position: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the position'
            },
            title: {
              type: 'string',
              description: 'Title of the position'
            },
            description: {
              type: 'string',
              description: 'Description of the position'
            },
            level: {
              type: 'integer',
              description: 'Level of the position'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the user'
            },
            username: {
              type: 'string',
              description: 'Username of the user'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user'
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'HR', 'EMPLOYEE'],
              description: 'Role of the user'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the user account is active'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Status of the response'
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // Path to the API files
};

const specs = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'HRMS API Documentation'
  }));
};

module.exports = { setupSwagger };
