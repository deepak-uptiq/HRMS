const express = require('express');
const { validate } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const { authenticate, authorize, authorizeEmployeeAccess } = require('../middleware/auth');
const { auditLog, captureOldValues } = require('../middleware/audit');
const {
  createPerformanceReviewSchema,
  updatePerformanceReviewSchema,
  getPerformanceReviewSchema,
  deletePerformanceReviewSchema,
  getPerformanceReviewsSchema,
  submitSelfReviewSchema
} = require('../validators/performanceValidator');
const {
  getAllPerformanceReviews,
  getPerformanceReviewById,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
  submitSelfReview,
  completePerformanceReview,
  getEmployeePerformanceReviews
} = require('../controllers/performanceController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/performance-reviews:
 *   get:
 *     summary: Get all performance reviews (HR/Admin only)
 *     tags: [Performance Reviews]
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
 *         description: Number of reviews per page
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Filter by review period
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Filter by rating
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in employee name or ID
 *     responses:
 *       200:
 *         description: List of performance reviews
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authorize('ADMIN', 'HR'), validate(getPerformanceReviewsSchema), catchAsync(getAllPerformanceReviews));

/**
 * @swagger
 * /api/v1/performance-reviews/my-reviews:
 *   get:
 *     summary: Get employee's own performance reviews (Employee only)
 *     tags: [Performance Reviews]
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
 *         description: Number of reviews per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of employee's performance reviews
 *       401:
 *         description: Unauthorized
 */
router.get('/my-reviews', authorize('EMPLOYEE'), catchAsync(getEmployeePerformanceReviews));

/**
 * @swagger
 * /api/v1/performance-reviews/{id}:
 *   get:
 *     summary: Get performance review by ID
 *     tags: [Performance Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Performance review details
 *       404:
 *         description: Performance review not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', validate(getPerformanceReviewSchema), authorizeEmployeeAccess, catchAsync(getPerformanceReviewById));

/**
 * @swagger
 * /api/v1/performance-reviews:
 *   post:
 *     summary: Create new performance review (HR/Admin only)
 *     tags: [Performance Reviews]
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
 *               - period
 *             properties:
 *               employeeId:
 *                 type: string
 *               period:
 *                 type: string
 *               goals:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     targetDate:
 *                       type: string
 *                       format: date
 *                     weight:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *               achievements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     impact:
 *                       type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Performance review created successfully
 *       400:
 *         description: Validation error or review already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authorize('ADMIN', 'HR'), validate(createPerformanceReviewSchema), auditLog('CREATE', 'PERFORMANCE_REVIEW'), catchAsync(createPerformanceReview));

/**
 * @swagger
 * /api/v1/performance-reviews/{id}:
 *   put:
 *     summary: Update performance review (HR/Admin only)
 *     tags: [Performance Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               period:
 *                 type: string
 *               goals:
 *                 type: array
 *               achievements:
 *                 type: array
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comments:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Performance review updated successfully
 *       404:
 *         description: Performance review not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authorize('ADMIN', 'HR'), validate(updatePerformanceReviewSchema), captureOldValues, auditLog('UPDATE', 'PERFORMANCE_REVIEW'), catchAsync(updatePerformanceReview));

/**
 * @swagger
 * /api/v1/performance-reviews/{id}/submit-self-review:
 *   put:
 *     summary: Submit self-review (Employee only)
 *     tags: [Performance Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               goals:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     targetDate:
 *                       type: string
 *                       format: date
 *                     weight:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                     selfRating:
 *                       type: number
 *                       minimum: 1
 *                       maximum: 5
 *               achievements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     impact:
 *                       type: string
 *               selfComments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Self-review submitted successfully
 *       404:
 *         description: Performance review not found or access denied
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/submit-self-review', authorize('EMPLOYEE'), validate(submitSelfReviewSchema), auditLog('SUBMIT_SELF_REVIEW', 'PERFORMANCE_REVIEW'), catchAsync(submitSelfReview));

/**
 * @swagger
 * /api/v1/performance-reviews/{id}/complete:
 *   put:
 *     summary: Complete performance review (HR/Admin only)
 *     tags: [Performance Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Performance review completed successfully
 *       404:
 *         description: Performance review not found
 *       400:
 *         description: Performance review already completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id/complete', authorize('ADMIN', 'HR'), auditLog('COMPLETE', 'PERFORMANCE_REVIEW'), catchAsync(completePerformanceReview));

/**
 * @swagger
 * /api/v1/performance-reviews/{id}:
 *   delete:
 *     summary: Delete performance review (HR/Admin only)
 *     tags: [Performance Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       204:
 *         description: Performance review deleted successfully
 *       404:
 *         description: Performance review not found
 *       400:
 *         description: Cannot delete completed reviews
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authorize('ADMIN', 'HR'), auditLog('DELETE', 'PERFORMANCE_REVIEW'), catchAsync(deletePerformanceReview));

module.exports = router;
