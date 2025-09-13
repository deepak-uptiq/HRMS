const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// Get all positions
const getAllPositions = async (req, res, next) => {
  try {
    const positions = await prisma.position.findMany({
      include: {
        employees: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true
          }
        }
      },
      orderBy: {
        level: 'asc'
      }
    });

    res.status(200).json({
      status: 'success',
      results: positions.length,
      data: positions
    });
  } catch (error) {
    logger.error('Error fetching positions:', error);
    next(error);
  }
};

// Get position by ID
const getPositionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isActive: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!position) {
      return next(new AppError('Position not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: position
    });
  } catch (error) {
    logger.error('Error fetching position:', error);
    next(error);
  }
};

// Create new position
const createPosition = async (req, res, next) => {
  try {
    const { title, description, level } = req.body;

    // Check if position with title already exists
    const existingPosition = await prisma.position.findUnique({
      where: { title }
    });

    if (existingPosition) {
      return next(new AppError('Position with this title already exists', 400));
    }

    const position = await prisma.position.create({
      data: {
        title,
        description,
        level: level || 1
      }
    });

    logger.info(`New position created: ${position.id}`);

    res.status(201).json({
      status: 'success',
      data: position
    });
  } catch (error) {
    logger.error('Error creating position:', error);
    next(error);
  }
};

// Update position
const updatePosition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, level } = req.body;

    // Check if position exists
    const existingPosition = await prisma.position.findUnique({
      where: { id }
    });

    if (!existingPosition) {
      return next(new AppError('Position not found', 404));
    }

    // If title is being updated, check for duplicates
    if (title && title !== existingPosition.title) {
      const titleExists = await prisma.position.findUnique({
        where: { title }
      });

      if (titleExists) {
        return next(new AppError('Position with this title already exists', 400));
      }
    }

    const position = await prisma.position.update({
      where: { id },
      data: {
        title: title || existingPosition.title,
        description: description !== undefined ? description : existingPosition.description,
        level: level !== undefined ? level : existingPosition.level
      }
    });

    logger.info(`Position updated: ${position.id}`);

    res.status(200).json({
      status: 'success',
      data: position
    });
  } catch (error) {
    logger.error('Error updating position:', error);
    next(error);
  }
};

// Delete position
const deletePosition = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if position exists
    const existingPosition = await prisma.position.findUnique({
      where: { id },
      include: {
        employees: true
      }
    });

    if (!existingPosition) {
      return next(new AppError('Position not found', 404));
    }

    // Check if position has employees
    if (existingPosition.employees.length > 0) {
      return next(new AppError('Cannot delete position with existing employees', 400));
    }

    await prisma.position.delete({
      where: { id }
    });

    logger.info(`Position deleted: ${id}`);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Error deleting position:', error);
    next(error);
  }
};

module.exports = {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition
};
