const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const ragController = require('../controllers/ragController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { z } = require('zod');

// Employee leave request validation schema (without employeeId since it's auto-set)
const createEmployeeLeaveSchema = z.object({
  body: z.object({
    type: z.enum(['SICK', 'VACATION', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'EMERGENCY'], {
      errorMap: () => ({ message: 'Invalid leave type' })
    }),
    startDate: z.string().datetime().or(z.string().date()),
    endDate: z.string().datetime().or(z.string().date()),
    reason: z.string().optional()
  })
});

// RAG question validation schema
const ragQuestionSchema = z.object({
  body: z.object({
    question: z.string().min(1, 'Question is required').max(500, 'Question too long')
  })
});

// Apply authentication middleware to all routes
router.use(authenticate);

// Employee profile routes
router.get('/profile', employeeController.getProfile);
router.patch('/profile', employeeController.updateProfile);

// Leave request routes
router.get('/leaves', employeeController.getLeaveRequests);
router.post('/leaves', validate(createEmployeeLeaveSchema), employeeController.createLeaveRequest);

// Payslip routes
router.get('/payslips', employeeController.getPayslips);
router.get('/payslips/:id/download', employeeController.downloadPayslip);

// Performance review routes
router.get('/performance-reviews', employeeController.getPerformanceReviews);

// RAG Q&A routes
router.post('/ask', validate(ragQuestionSchema), ragController.askQuestion);
router.get('/faq', ragController.getAvailableQuestions);

module.exports = router;