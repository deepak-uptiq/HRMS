const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// Get all attendances
const getAllAttendances = async (req, res, next) => {
  try {
    const attendances = await prisma.attendance.findMany({
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
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.status(200).json({
      status: 'success',
      results: attendances.length,
      data: attendances
    });
  } catch (error) {
    logger.error('Error fetching attendances:', error);
    next(error);
  }
};

// Get attendance by ID
const getAttendanceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.findUnique({
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
            }
          }
        }
      }
    });

    if (!attendance) {
      return next(new AppError('Attendance not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: attendance
    });
  } catch (error) {
    logger.error('Error fetching attendance:', error);
    next(error);
  }
};

// Create new attendance
const createAttendance = async (req, res, next) => {
  try {
    const { date, checkIn, checkOut, hoursWorked, status, notes, employeeId } = req.body;

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    // Validate check-in and check-out times
    if (checkIn && checkOut) {
      const checkInTime = new Date(checkIn);
      const checkOutTime = new Date(checkOut);

      if (checkInTime >= checkOutTime) {
        return next(new AppError('Check-out time must be after check-in time', 400));
      }

      // Calculate hours worked if not provided
      if (!hoursWorked) {
        const diffMs = checkOutTime - checkInTime;
        const diffHours = diffMs / (1000 * 60 * 60);
        req.body.hoursWorked = Math.round(diffHours * 100) / 100; // Round to 2 decimal places
      }
    }

    // Convert dates to Date objects
    const attendanceData = {
      date: date ? new Date(date) : new Date(),
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      hoursWorked: hoursWorked || null,
      status: status || 'PRESENT',
      notes,
      employeeId
    };

    const attendance = await prisma.attendance.create({
      data: attendanceData,
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

    logger.info(`New attendance record created: ${attendance.id}`);

    res.status(201).json({
      status: 'success',
      data: attendance
    });
  } catch (error) {
    logger.error('Error creating attendance:', error);
    next(error);
  }
};

// Update attendance
const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if attendance exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id }
    });

    if (!existingAttendance) {
      return next(new AppError('Attendance not found', 404));
    }

    // Validate check-in and check-out times if both are provided
    if (updateData.checkIn && updateData.checkOut) {
      const checkInTime = new Date(updateData.checkIn);
      const checkOutTime = new Date(updateData.checkOut);

      if (checkInTime >= checkOutTime) {
        return next(new AppError('Check-out time must be after check-in time', 400));
      }

      // Calculate hours worked if not provided
      if (!updateData.hoursWorked) {
        const diffMs = checkOutTime - checkInTime;
        const diffHours = diffMs / (1000 * 60 * 60);
        updateData.hoursWorked = Math.round(diffHours * 100) / 100;
      }
    }

    // Convert dates to Date objects if provided
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    if (updateData.checkIn) {
      updateData.checkIn = new Date(updateData.checkIn);
    }
    if (updateData.checkOut) {
      updateData.checkOut = new Date(updateData.checkOut);
    }

    const attendance = await prisma.attendance.update({
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

    logger.info(`Attendance updated: ${attendance.id}`);

    res.status(200).json({
      status: 'success',
      data: attendance
    });
  } catch (error) {
    logger.error('Error updating attendance:', error);
    next(error);
  }
};

// Delete attendance
const deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if attendance exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id }
    });

    if (!existingAttendance) {
      return next(new AppError('Attendance not found', 404));
    }

    await prisma.attendance.delete({
      where: { id }
    });

    logger.info(`Attendance deleted: ${id}`);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Error deleting attendance:', error);
    next(error);
  }
};

module.exports = {
  getAllAttendances,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance
};
