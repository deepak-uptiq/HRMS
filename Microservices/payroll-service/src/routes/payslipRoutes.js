const express = require('express');
const { validate } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const { authenticate, authorize, authorizeEmployeeAccess } = require('../middleware/auth');
const { auditLog, captureOldValues } = require('../middleware/audit');
const {
  createPayslipSchema,
  updatePayslipSchema,
  getPayslipSchema,
  deletePayslipSchema,
  getPayslipsSchema,
  generatePayslipsSchema
} = require('../validators/payslipValidator');
const {
  getAllPayslips,
  getPayslipById,
  createPayslip,
  updatePayslip,
  deletePayslip,
  generatePayslips,
  markPayslipAsPaid,
  getEmployeePayslips
} = require('../controllers/payslipController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/payslips:
 *   get:
 *     summary: Get all payslips (HR/Admin only)
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of payslips per page
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Filter by month
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, GENERATED, PAID, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in employee name or ID
 *     responses:
 *       200:
 *         description: List of payslips
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authorize('ADMIN', 'HR'), validate(getPayslipsSchema), catchAsync(getAllPayslips));

/**
 * @swagger
 * /api/v1/payslips/my-payslips:
 *   get:
 *     summary: Get employee's own payslips (Employee only)
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of payslips per page
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *     responses:
 *       200:
 *         description: List of employee's payslips
 *       401:
 *         description: Unauthorized
 */
router.get('/my-payslips', authorize('EMPLOYEE'), catchAsync(getEmployeePayslips));

/**
 * @swagger
 * /api/v1/payslips/{id}:
 *   get:
 *     summary: Get payslip by ID
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payslip ID
 *     responses:
 *       200:
 *         description: Payslip details
 *       404:
 *         description: Payslip not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', validate(getPayslipSchema), authorizeEmployeeAccess, catchAsync(getPayslipById));

/**
 * @swagger
 * /api/v1/payslips:
 *   post:
 *     summary: Create new payslip (HR/Admin only)
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - month
 *               - year
 *               - basicSalary
 *             properties:
 *               employeeId:
 *                 type: string
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *               year:
 *                 type: integer
 *                 minimum: 2020
 *                 maximum: 2030
 *               basicSalary:
 *                 type: number
 *               allowances:
 *                 type: number
 *               deductions:
 *                 type: number
 *               overtimeHours:
 *                 type: number
 *               overtimeRate:
 *                 type: number
 *     responses:
 *       201:
 *         description: Payslip created successfully
 *       400:
 *         description: Validation error or payslip already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authorize('ADMIN', 'HR'), validate(createPayslipSchema), auditLog('CREATE', 'PAYSLIP'), catchAsync(createPayslip));

/**
 * @swagger
 * /api/v1/payslips/generate:
 *   post:
 *     summary: Generate payslips for multiple employees (HR/Admin only)
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - month
 *               - year
 *             properties:
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *               year:
 *                 type: integer
 *                 minimum: 2020
 *                 maximum: 2030
 *               employeeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of employee IDs (optional, generates for all if not provided)
 *     responses:
 *       201:
 *         description: Payslips generated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/generate', authorize('ADMIN', 'HR'), validate(generatePayslipsSchema), auditLog('GENERATE', 'PAYSLIP'), catchAsync(generatePayslips));

/**
 * @swagger
 * /api/v1/payslips/{id}:
 *   put:
 *     summary: Update payslip (HR/Admin only)
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payslip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               basicSalary:
 *                 type: number
 *               allowances:
 *                 type: number
 *               deductions:
 *                 type: number
 *               overtimeHours:
 *                 type: number
 *               overtimeRate:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [PENDING, GENERATED, PAID, CANCELLED]
 *     responses:
 *       200:
 *         description: Payslip updated successfully
 *       404:
 *         description: Payslip not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authorize('ADMIN', 'HR'), validate(updatePayslipSchema), captureOldValues, auditLog('UPDATE', 'PAYSLIP'), catchAsync(updatePayslip));

/**
 * @swagger
 * /api/v1/payslips/{id}/mark-paid:
 *   put:
 *     summary: Mark payslip as paid (HR/Admin only)
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payslip ID
 *     responses:
 *       200:
 *         description: Payslip marked as paid
 *       404:
 *         description: Payslip not found
 *       400:
 *         description: Payslip already marked as paid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id/mark-paid', authorize('ADMIN', 'HR'), auditLog('MARK_PAID', 'PAYSLIP'), catchAsync(markPayslipAsPaid));

/**
 * @swagger
 * /api/v1/payslips/{id}:
 *   delete:
 *     summary: Delete payslip (HR/Admin only)
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payslip ID
 *     responses:
 *       204:
 *         description: Payslip deleted successfully
 *       404:
 *         description: Payslip not found
 *       400:
 *         description: Cannot delete paid payslips
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authorize('ADMIN', 'HR'), auditLog('DELETE', 'PAYSLIP'), catchAsync(deletePayslip));

module.exports = router;
