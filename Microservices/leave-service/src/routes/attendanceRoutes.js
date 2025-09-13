const express = require('express');
const { validate } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const {
  createAttendanceSchema,
  updateAttendanceSchema,
  getAttendanceSchema,
  deleteAttendanceSchema
} = require('../validators/attendanceValidator');
const {
  createAttendance,
  getAllAttendances,
  getAttendanceById,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/attendances:
 *   get:
 *     summary: Get all attendances
 *     tags: [Attendances]
 *     responses:
 *       200:
 *         description: List of all attendances
 */
router.get('/', catchAsync(getAllAttendances));

/**
 * @swagger
 * /api/v1/attendances/{id}:
 *   get:
 *     summary: Get attendance by ID
 *     tags: [Attendances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance ID
 *     responses:
 *       200:
 *         description: Attendance details
 *       404:
 *         description: Attendance not found
 */
router.get('/:id', validate(getAttendanceSchema), catchAsync(getAttendanceById));

/**
 * @swagger
 * /api/v1/attendances:
 *   post:
 *     summary: Create a new attendance record
 *     tags: [Attendances]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               checkIn:
 *                 type: string
 *                 format: date-time
 *               checkOut:
 *                 type: string
 *                 format: date-time
 *               hoursWorked:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 24
 *               status:
 *                 type: string
 *                 enum: [PRESENT, ABSENT, LATE, HALF_DAY]
 *               notes:
 *                 type: string
 *               employeeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attendance record created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', validate(createAttendanceSchema), catchAsync(createAttendance));

/**
 * @swagger
 * /api/v1/attendances/{id}:
 *   put:
 *     summary: Update an attendance record
 *     tags: [Attendances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               checkIn:
 *                 type: string
 *                 format: date-time
 *               checkOut:
 *                 type: string
 *                 format: date-time
 *               hoursWorked:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 24
 *               status:
 *                 type: string
 *                 enum: [PRESENT, ABSENT, LATE, HALF_DAY]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 *       404:
 *         description: Attendance not found
 */
router.put('/:id', validate(updateAttendanceSchema), catchAsync(updateAttendance));

/**
 * @swagger
 * /api/v1/attendances/{id}:
 *   delete:
 *     summary: Delete an attendance record
 *     tags: [Attendances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance ID
 *     responses:
 *       204:
 *         description: Attendance record deleted successfully
 *       404:
 *         description: Attendance not found
 */
router.delete('/:id', validate(deleteAttendanceSchema), catchAsync(deleteAttendance));

module.exports = router;
