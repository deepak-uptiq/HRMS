const { z } = require('zod');

// Department validation schemas
const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Department name must be at least 2 characters'),
    description: z.string().optional()
  })
});

const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Department ID is required')
  }),
  body: z.object({
    name: z.string().min(2, 'Department name must be at least 2 characters').optional(),
    description: z.string().optional()
  })
});

const getDepartmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Department ID is required')
  })
});

const deleteDepartmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Department ID is required')
  })
});

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema,
  getDepartmentSchema,
  deleteDepartmentSchema
};
