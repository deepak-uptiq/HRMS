const { z } = require('zod');

// Login validation schema
const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

// Register validation schema
const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    requestedRole: z.enum(['ADMIN', 'HR', 'EMPLOYEE']).optional(),
    employeeId: z.string().optional()
  })
});

// Change password validation schema
const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters')
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  })
});

// Update profile validation schema
const updateProfileSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().optional(),
    address: z.string().optional()
  })
});

module.exports = {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  updateProfileSchema
};
