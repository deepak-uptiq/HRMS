const express = require('express');
const { validate } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const { authenticate, authorize } = require('../middleware/auth');
const { auditLog, captureOldValues } = require('../middleware/audit');
const {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  getAnnouncementSchema,
  deleteAnnouncementSchema,
  getAnnouncementsSchema
} = require('../validators/announcementValidator');
const {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements
} = require('../controllers/announcementController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/announcements:
 *   get:
 *     summary: Get all announcements
 *     tags: [Announcements]
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
 *         description: Number of announcements per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [GENERAL, URGENT, POLICY, EVENT]
 *         description: Filter by announcement type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, NORMAL, HIGH, URGENT]
 *         description: Filter by priority
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *     responses:
 *       200:
 *         description: List of announcements
 *       401:
 *         description: Unauthorized
 */
router.get('/', validate(getAnnouncementsSchema), catchAsync(getAllAnnouncements));

/**
 * @swagger
 * /api/v1/announcements/active:
 *   get:
 *     summary: Get active announcements (for employee dashboard)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active announcements
 *       401:
 *         description: Unauthorized
 */
router.get('/active', catchAsync(getActiveAnnouncements));

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   get:
 *     summary: Get announcement by ID
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement details
 *       404:
 *         description: Announcement not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', validate(getAnnouncementSchema), catchAsync(getAnnouncementById));

/**
 * @swagger
 * /api/v1/announcements:
 *   post:
 *     summary: Create new announcement (Admin/HR only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [GENERAL, URGENT, POLICY, EVENT]
 *               priority:
 *                 type: string
 *                 enum: [LOW, NORMAL, HIGH, URGENT]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authorize('ADMIN', 'HR'), validate(createAnnouncementSchema), auditLog('CREATE', 'ANNOUNCEMENT'), catchAsync(createAnnouncement));

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   put:
 *     summary: Update announcement (Admin/HR only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [GENERAL, URGENT, POLICY, EVENT]
 *               priority:
 *                 type: string
 *                 enum: [LOW, NORMAL, HIGH, URGENT]
 *               isActive:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 *       404:
 *         description: Announcement not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authorize('ADMIN', 'HR'), validate(updateAnnouncementSchema), captureOldValues, auditLog('UPDATE', 'ANNOUNCEMENT'), catchAsync(updateAnnouncement));

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   delete:
 *     summary: Delete announcement (Admin/HR only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     responses:
 *       204:
 *         description: Announcement deleted successfully
 *       404:
 *         description: Announcement not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authorize('ADMIN', 'HR'), auditLog('DELETE', 'ANNOUNCEMENT'), catchAsync(deleteAnnouncement));

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   patch:
 *     summary: Update announcement status (Admin/HR only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Announcement status updated
 *       404:
 *         description: Announcement not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch('/:id', authorize('ADMIN', 'HR'), catchAsync(updateAnnouncement));

module.exports = router;
