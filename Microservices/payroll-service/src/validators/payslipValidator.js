const { z } = require('zod');

// Payslip validation schemas
const createPayslipSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    month: z.number().int().min(1).max(12, 'Month must be between 1 and 12'),
    year: z.number().int().min(2020).max(2030, 'Year must be between 2020 and 2030'),
    basicSalary: z.number().positive('Basic salary must be positive'),
    allowances: z.number().min(0, 'Allowances cannot be negative').optional(),
    deductions: z.number().min(0, 'Deductions cannot be negative').optional(),
    overtimeHours: z.number().min(0, 'Overtime hours cannot be negative').optional(),
    overtimeRate: z.number().min(0, 'Overtime rate cannot be negative').optional()
  })
});

const updatePayslipSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Payslip ID is required')
  }),
  body: z.object({
    basicSalary: z.number().positive('Basic salary must be positive').optional(),
    allowances: z.number().min(0, 'Allowances cannot be negative').optional(),
    deductions: z.number().min(0, 'Deductions cannot be negative').optional(),
    overtimeHours: z.number().min(0, 'Overtime hours cannot be negative').optional(),
    overtimeRate: z.number().min(0, 'Overtime rate cannot be negative').optional(),
    status: z.enum(['PENDING', 'GENERATED', 'PAID', 'CANCELLED']).optional()
  })
});

const getPayslipSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Payslip ID is required')
  })
});

const deletePayslipSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Payslip ID is required')
  })
});

const getPayslipsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    employeeId: z.string().optional(),
    month: z.string().optional(),
    year: z.string().optional(),
    status: z.enum(['PENDING', 'GENERATED', 'PAID', 'CANCELLED']).optional(),
    search: z.string().optional()
  })
});

const generatePayslipsSchema = z.object({
  body: z.object({
    month: z.number().int().min(1).max(12, 'Month must be between 1 and 12'),
    year: z.number().int().min(2020).max(2030, 'Year must be between 2020 and 2030'),
    employeeIds: z.array(z.string()).optional() // If not provided, generate for all active employees
  })
});

module.exports = {
  createPayslipSchema,
  updatePayslipSchema,
  getPayslipSchema,
  deletePayslipSchema,
  getPayslipsSchema,
  generatePayslipsSchema
};
