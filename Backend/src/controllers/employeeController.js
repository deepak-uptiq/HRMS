const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// Get employee profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const employee = await prisma.employee.findFirst({
      where: { userId },
      include: {
        department: {
          select: { id: true, name: true }
        },
        position: {
          select: { id: true, title: true }
        }
      }
    });

    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    logger.error('Get employee profile error:', error);
    next(error);
  }
};

// Update employee profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, phone, address } = req.body;

    const employee = await prisma.employee.findFirst({
      where: { userId }
    });

    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address
      },
      include: {
        department: {
          select: { id: true, name: true }
        },
        position: {
          select: { id: true, title: true }
        }
      }
    });

    res.json({
      success: true,
      data: updatedEmployee,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error('Update employee profile error:', error);
    next(error);
  }
};

// Get employee leave requests
const getLeaveRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const employee = await prisma.employee.findFirst({
      where: { userId }
    });

    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    const leaves = await prisma.leave.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    logger.error('Get employee leave requests error:', error);
    next(error);
  }
};

// Create leave request
const createLeaveRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, startDate, endDate, reason } = req.body;

    const employee = await prisma.employee.findFirst({
      where: { userId }
    });

    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    const leave = await prisma.leave.create({
      data: {
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING',
        employeeId: employee.id
      }
    });

    res.status(201).json({
      success: true,
      data: leave,
      message: 'Leave request submitted successfully'
    });
  } catch (error) {
    logger.error('Create leave request error:', error);
    next(error);
  }
};

// Get employee payslips
const getPayslips = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;
    
    const employee = await prisma.employee.findFirst({
      where: { userId }
    });

    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    const whereClause = { employeeId: employee.id };
    if (year) {
      whereClause.year = parseInt(year);
    }

    const payslips = await prisma.payslip.findMany({
      where: whereClause,
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: payslips
    });
  } catch (error) {
    logger.error('Get employee payslips error:', error);
    next(error);
  }
};

// Download payslip
const downloadPayslip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const employee = await prisma.employee.findFirst({
      where: { userId }
    });

    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    const payslip = await prisma.payslip.findFirst({
      where: { 
        id,
        employeeId: employee.id
      }
    });

    if (!payslip) {
      throw new AppError('Payslip not found', 404);
    }

    if (payslip.status === 'PENDING') {
      throw new AppError('Payslip not yet generated', 400);
    }

    // For now, return a simple JSON response
    // In production, you would generate a PDF here
    res.json({
      success: true,
      data: payslip,
      message: 'Payslip data retrieved successfully'
    });
  } catch (error) {
    logger.error('Download payslip error:', error);
    next(error);
  }
};

// Get employee performance reviews
const getPerformanceReviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const employee = await prisma.employee.findFirst({
      where: { userId }
    });

    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    const reviews = await prisma.performanceReview.findMany({
      where: { employeeId: employee.id },
      include: {
        reviewer: {
          select: { username: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    logger.error('Get employee performance reviews error:', error);
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getLeaveRequests,
  createLeaveRequest,
  getPayslips,
  downloadPayslip,
  getPerformanceReviews
};