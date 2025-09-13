const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Employee profile routes
router.get('/profile', employeeController.getProfile);
router.patch('/profile', employeeController.updateProfile);

// Leave request routes
router.get('/leaves', employeeController.getLeaveRequests);
router.post('/leaves', employeeController.createLeaveRequest);

// Payslip routes
router.get('/payslips', employeeController.getPayslips);
router.get('/payslips/:id/download', employeeController.downloadPayslip);

// Performance review routes
router.get('/performance-reviews', employeeController.getPerformanceReviews);

module.exports = router;