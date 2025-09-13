const { z } = require('zod');

// Employee validation schemas
const createEmployeeSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    phone: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.string().datetime().optional().or(z.string().date().optional()),
    salary: z.number().positive('Salary must be positive').optional(),
    departmentId: z.string().min(1, 'Department ID is required'),
    positionId: z.string().min(1, 'Position ID is required')
  })
});

const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Employee ID is required')
  }),
  body: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.string().datetime().optional().or(z.string().date().optional()),
    salary: z.number().positive('Salary must be positive').optional(),
    departmentId: z.string().min(1, 'Department ID is required').optional(),
    positionId: z.string().min(1, 'Position ID is required').optional(),
    isActive: z.boolean().optional()
  })
});

const getEmployeeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Employee ID is required')
  })
});

const deleteEmployeeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Employee ID is required')
  })
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
  getEmployeeSchema,
  deleteEmployeeSchema
};
