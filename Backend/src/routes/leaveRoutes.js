const express = require('express');
const { validate } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createLeaveSchema,
  updateLeaveSchema,
  getLeaveSchema,
  deleteLeaveSchema
} = require('../validators/leaveValidator');
const {
  createLeave,
  getAllLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave
} = require('../controllers/leaveController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/leaves:
 *   get:
 *     summary: Get all leaves
 *     tags: [Leaves]
 *     responses:
 *       200:
 *         description: List of all leaves
 */
router.get('/', catchAsync(getAllLeaves));

/**
 * @swagger
 * /api/v1/leaves/{id}:
 *   get:
 *     summary: Get leave by ID
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID
 *     responses:
 *       200:
 *         description: Leave details
 *       404:
 *         description: Leave not found
 */
router.get('/:id', validate(getLeaveSchema), catchAsync(getLeaveById));

/**
 * @swagger
 * /api/v1/leaves:
 *   post:
 *     summary: Create a new leave request
 *     tags: [Leaves]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - startDate
 *               - endDate
 *               - employeeId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [SICK, VACATION, PERSONAL, MATERNITY, PATERNITY, EMERGENCY]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *               employeeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Leave request created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', validate(createLeaveSchema), catchAsync(createLeave));

/**
 * @swagger
 * /api/v1/leaves/{id}:
 *   put:
 *     summary: Update a leave request
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [SICK, VACATION, PERSONAL, MATERNITY, PATERNITY, EMERGENCY]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED, CANCELLED]
 *     responses:
 *       200:
 *         description: Leave request updated successfully
 *       404:
 *         description: Leave not found
 */
router.put('/:id', validate(updateLeaveSchema), catchAsync(updateLeave));

/**
 * @swagger
 * /api/v1/leaves/{id}:
 *   patch:
 *     summary: Update leave request status (HR/Admin only)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *               reviewComment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Leave request status updated
 *       404:
 *         description: Leave not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch('/:id', authorize('ADMIN', 'HR'), catchAsync(updateLeave));

/**
 * @swagger
 * /api/v1/leaves/{id}:
 *   delete:
 *     summary: Delete a leave request
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID
 *     responses:
 *       204:
 *         description: Leave request deleted successfully
 *       404:
 *         description: Leave not found
 */
router.delete('/:id', validate(deleteLeaveSchema), catchAsync(deleteLeave));

module.exports = router;
