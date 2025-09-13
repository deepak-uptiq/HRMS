const express = require('express');
const { validate } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const { authenticate, authorize } = require('../middleware/auth');
const { auditLog, captureOldValues } = require('../middleware/audit');
const {
  createCompanySchema,
  updateCompanySchema,
  getCompanySchema
} = require('../validators/companyValidator');
const {
  getCompany,
  createCompany,
  updateCompany,
  getCompanyStats
} = require('../controllers/companyController');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * @swagger
 * /api/v1/company:
 *   get:
 *     summary: Get company configuration (Admin only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company configuration retrieved successfully
 *       404:
 *         description: Company configuration not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', catchAsync(getCompany));

/**
 * @swagger
 * /api/v1/company:
 *   post:
 *     summary: Create company configuration (Admin only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               website:
 *                 type: string
 *                 format: uri
 *               logo:
 *                 type: string
 *                 format: uri
 *               settings:
 *                 type: object
 *                 properties:
 *                   workingHours:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                       end:
 *                         type: string
 *                         pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                   workingDays:
 *                     type: array
 *                     items:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                   timezone:
 *                     type: string
 *                   currency:
 *                     type: string
 *                     minLength: 3
 *                     maxLength: 3
 *                   dateFormat:
 *                     type: string
 *                   leavePolicy:
 *                     type: object
 *                     properties:
 *                       maxAnnualLeave:
 *                         type: number
 *                       maxSickLeave:
 *                         type: number
 *                       maxPersonalLeave:
 *                         type: number
 *                       advanceNoticeDays:
 *                         type: number
 *                   payrollSettings:
 *                     type: object
 *                     properties:
 *                       payFrequency:
 *                         type: string
 *                         enum: [WEEKLY, BIWEEKLY, MONTHLY]
 *                       payDay:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 31
 *                       overtimeRate:
 *                         type: number
 *                       taxRate:
 *                         type: number
 *     responses:
 *       201:
 *         description: Company configuration created successfully
 *       400:
 *         description: Validation error or company already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', validate(createCompanySchema), auditLog('CREATE', 'COMPANY'), catchAsync(createCompany));

/**
 * @swagger
 * /api/v1/company/{id}:
 *   put:
 *     summary: Update company configuration (Admin only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               website:
 *                 type: string
 *                 format: uri
 *               logo:
 *                 type: string
 *                 format: uri
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Company configuration updated successfully
 *       404:
 *         description: Company configuration not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', validate(updateCompanySchema), captureOldValues, auditLog('UPDATE', 'COMPANY'), catchAsync(updateCompany));

/**
 * @swagger
 * /api/v1/company/stats:
 *   get:
 *     summary: Get company statistics (Admin only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats', catchAsync(getCompanyStats));

module.exports = router;
