const { z } = require('zod');

// Company configuration validation schemas
const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters'),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    website: z.string().url('Invalid website URL').optional(),
    logo: z.string().url('Invalid logo URL').optional(),
    settings: z.object({
      workingHours: z.object({
        start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
      }).optional(),
      workingDays: z.array(z.number().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday
      timezone: z.string().optional(),
      currency: z.string().length(3, 'Currency must be 3 characters').optional(),
      dateFormat: z.string().optional(),
      leavePolicy: z.object({
        maxAnnualLeave: z.number().min(0).optional(),
        maxSickLeave: z.number().min(0).optional(),
        maxPersonalLeave: z.number().min(0).optional(),
        advanceNoticeDays: z.number().min(0).optional()
      }).optional(),
      payrollSettings: z.object({
        payFrequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional(),
        payDay: z.number().min(1).max(31).optional(),
        overtimeRate: z.number().min(1).optional(),
        taxRate: z.number().min(0).max(1).optional()
      }).optional()
    }).optional()
  })
});

const updateCompanySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Company ID is required')
  }),
  body: z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters').optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    website: z.string().url('Invalid website URL').optional(),
    logo: z.string().url('Invalid logo URL').optional(),
    settings: z.object({
      workingHours: z.object({
        start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
      }).optional(),
      workingDays: z.array(z.number().min(0).max(6)).optional(),
      timezone: z.string().optional(),
      currency: z.string().length(3, 'Currency must be 3 characters').optional(),
      dateFormat: z.string().optional(),
      leavePolicy: z.object({
        maxAnnualLeave: z.number().min(0).optional(),
        maxSickLeave: z.number().min(0).optional(),
        maxPersonalLeave: z.number().min(0).optional(),
        advanceNoticeDays: z.number().min(0).optional()
      }).optional(),
      payrollSettings: z.object({
        payFrequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional(),
        payDay: z.number().min(1).max(31).optional(),
        overtimeRate: z.number().min(1).optional(),
        taxRate: z.number().min(0).max(1).optional()
      }).optional()
    }).optional()
  })
});

const getCompanySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Company ID is required')
  })
});

module.exports = {
  createCompanySchema,
  updateCompanySchema,
  getCompanySchema
};
