const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// Get all leaves
const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await prisma.leave.findMany({
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            department: {
              select: {
                name: true
              }
            },
            position: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      status: 'success',
      results: leaves.length,
      data: leaves
    });
  } catch (error) {
    logger.error('Error fetching leaves:', error);
    next(error);
  }
};

// Get leave by ID
const getLeaveById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leave.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            department: {
              select: {
                name: true
              }
            },
            position: {
              select: {
                title: true
              }
            }
          }
        }
      }
    });

    if (!leave) {
      return next(new AppError('Leave not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: leave
    });
  } catch (error) {
    logger.error('Error fetching leave:', error);
    next(error);
  }
};

// Create new leave
const createLeave = async (req, res, next) => {
  try {
    const { type, startDate, endDate, reason, employeeId } = req.body;

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return next(new AppError('End date must be after start date', 400));
    }

    if (start < new Date()) {
      return next(new AppError('Start date cannot be in the past', 400));
    }

    const leave = await prisma.leave.create({
      data: {
        type,
        startDate: start,
        endDate: end,
        reason,
        employeeId
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    logger.info(`New leave request created: ${leave.id}`);

    res.status(201).json({
      status: 'success',
      data: leave
    });
  } catch (error) {
    logger.error('Error creating leave:', error);
    next(error);
  }
};

// Update leave
const updateLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if leave exists
    const existingLeave = await prisma.leave.findUnique({
      where: { id }
    });

    if (!existingLeave) {
      return next(new AppError('Leave not found', 404));
    }

    // Validate date range if dates are being updated
    if (updateData.startDate || updateData.endDate) {
      const startDate = updateData.startDate ? new Date(updateData.startDate) : existingLeave.startDate;
      const endDate = updateData.endDate ? new Date(updateData.endDate) : existingLeave.endDate;

      if (startDate >= endDate) {
        return next(new AppError('End date must be after start date', 400));
      }
    }

    // Convert dates to Date objects if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    logger.info(`Leave updated: ${leave.id}`);

    res.status(200).json({
      status: 'success',
      data: leave
    });
  } catch (error) {
    logger.error('Error updating leave:', error);
    next(error);
  }
};

// Delete leave
const deleteLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if leave exists
    const existingLeave = await prisma.leave.findUnique({
      where: { id }
    });

    if (!existingLeave) {
      return next(new AppError('Leave not found', 404));
    }

    await prisma.leave.delete({
      where: { id }
    });

    logger.info(`Leave deleted: ${id}`);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Error deleting leave:', error);
    next(error);
  }
};

module.exports = {
  getAllLeaves,
  getLeaveById,
  createLeave,
  updateLeave,
  deleteLeave
};
