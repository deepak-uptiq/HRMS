const express = require('express');
const { validate } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const {
  createDepartmentSchema,
  updateDepartmentSchema,
  getDepartmentSchema,
  deleteDepartmentSchema
} = require('../validators/departmentValidator');
const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: List of all departments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Department'
 */
router.get('/', catchAsync(getAllDepartments));

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department not found
 */
router.get('/:id', validate(getDepartmentSchema), catchAsync(getDepartmentById));

/**
 * @swagger
 * /api/v1/departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
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
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       400:
 *         description: Validation error
 */
router.post('/', validate(createDepartmentSchema), catchAsync(createDepartment));

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   put:
 *     summary: Update a department
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department not found
 */
router.put('/:id', validate(updateDepartmentSchema), catchAsync(updateDepartment));

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   delete:
 *     summary: Delete a department
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       204:
 *         description: Department deleted successfully
 *       404:
 *         description: Department not found
 */
router.delete('/:id', validate(deleteDepartmentSchema), catchAsync(deleteDepartment));

module.exports = router;
