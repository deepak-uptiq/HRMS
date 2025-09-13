const { z } = require('zod');

// Attendance validation schemas
const createAttendanceSchema = z.object({
  body: z.object({
    date: z.string().datetime().or(z.string().date()).optional(),
    checkIn: z.string().datetime().optional(),
    checkOut: z.string().datetime().optional(),
    hoursWorked: z.number().min(0).max(24).optional(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']).optional(),
    notes: z.string().optional(),
    employeeId: z.string().min(1, 'Employee ID is required')
  })
});

const updateAttendanceSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Attendance ID is required')
  }),
  body: z.object({
    date: z.string().datetime().or(z.string().date()).optional(),
    checkIn: z.string().datetime().optional(),
    checkOut: z.string().datetime().optional(),
    hoursWorked: z.number().min(0).max(24).optional(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']).optional(),
    notes: z.string().optional()
  })
});

const getAttendanceSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Attendance ID is required')
  })
});

const deleteAttendanceSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Attendance ID is required')
  })
});

module.exports = {
  createAttendanceSchema,
  updateAttendanceSchema,
  getAttendanceSchema,
  deleteAttendanceSchema
};
