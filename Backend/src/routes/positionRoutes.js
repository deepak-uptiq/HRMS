const express = require('express');
const { validate } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const {
  createPositionSchema,
  updatePositionSchema,
  getPositionSchema,
  deletePositionSchema
} = require('../validators/positionValidator');
const {
  createPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  deletePosition
} = require('../controllers/positionController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/positions:
 *   get:
 *     summary: Get all positions
 *     tags: [Positions]
 *     responses:
 *       200:
 *         description: List of all positions
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
 *                     $ref: '#/components/schemas/Position'
 */
router.get('/', catchAsync(getAllPositions));

/**
 * @swagger
 * /api/v1/positions/{id}:
 *   get:
 *     summary: Get position by ID
 *     tags: [Positions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     responses:
 *       200:
 *         description: Position details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Position'
 *       404:
 *         description: Position not found
 */
router.get('/:id', validate(getPositionSchema), catchAsync(getPositionById));

/**
 * @swagger
 * /api/v1/positions:
 *   post:
 *     summary: Create a new position
 *     tags: [Positions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               level:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Position created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Position'
 *       400:
 *         description: Validation error
 */
router.post('/', validate(createPositionSchema), catchAsync(createPosition));

/**
 * @swagger
 * /api/v1/positions/{id}:
 *   put:
 *     summary: Update a position
 *     tags: [Positions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               level:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Position updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Position'
 *       404:
 *         description: Position not found
 */
router.put('/:id', validate(updatePositionSchema), catchAsync(updatePosition));

/**
 * @swagger
 * /api/v1/positions/{id}:
 *   delete:
 *     summary: Delete a position
 *     tags: [Positions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     responses:
 *       204:
 *         description: Position deleted successfully
 *       404:
 *         description: Position not found
 */
router.delete('/:id', validate(deletePositionSchema), catchAsync(deletePosition));

module.exports = router;
