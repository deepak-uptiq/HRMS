const { z } = require('zod');

// Leave validation schemas
const createLeaveSchema = z.object({
  body: z.object({
    type: z.enum(['SICK', 'VACATION', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'EMERGENCY'], {
      errorMap: () => ({ message: 'Invalid leave type' })
    }),
    startDate: z.string().datetime().or(z.string().date()),
    endDate: z.string().datetime().or(z.string().date()),
    reason: z.string().optional(),
    employeeId: z.string().min(1, 'Employee ID is required')
  })
});

const updateLeaveSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Leave ID is required')
  }),
  body: z.object({
    type: z.enum(['SICK', 'VACATION', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'EMERGENCY']).optional(),
    startDate: z.string().datetime().or(z.string().date()).optional(),
    endDate: z.string().datetime().or(z.string().date()).optional(),
    reason: z.string().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional()
  })
});

const getLeaveSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Leave ID is required')
  })
});

const deleteLeaveSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Leave ID is required')
  })
});

module.exports = {
  createLeaveSchema,
  updateLeaveSchema,
  getLeaveSchema,
  deleteLeaveSchema
};
