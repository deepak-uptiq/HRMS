const express = require('express');
const { validate } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const { authenticate, authorize } = require('../middleware/auth');
const { auditLog, captureOldValues } = require('../middleware/audit');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAuditLogs,
  getPendingUsers,
  approveUser,
  rejectUser
} = require('../controllers/userController');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
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
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, HR, EMPLOYEE]
 *         description: Filter by role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username or email
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', catchAsync(getAllUsers));

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/:id', catchAsync(getUserById));

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [ADMIN, HR, EMPLOYEE]
 *               employeeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or user already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', catchAsync(createUser));

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [ADMIN, HR, EMPLOYEE]
 *               isActive:
 *                 type: boolean
 *               employeeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', captureOldValues, auditLog('UPDATE', 'USER'), catchAsync(updateUser));

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', auditLog('DELETE', 'USER'), catchAsync(deleteUser));

/**
 * @swagger
 * /api/v1/users/audit-logs:
 *   get:
 *     summary: Get audit logs (Admin only)
 *     tags: [Users]
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
 *         description: Number of logs per page
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *         description: Filter by entity
 *     responses:
 *       200:
 *         description: List of audit logs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/audit-logs', catchAsync(getAuditLogs));

// Approval workflow
router.get('/pending/list', catchAsync(getPendingUsers));
router.put('/:id/approve', auditLog('APPROVE', 'USER'), catchAsync(approveUser));
router.put('/:id/reject', auditLog('REJECT', 'USER'), catchAsync(rejectUser));

module.exports = router;
