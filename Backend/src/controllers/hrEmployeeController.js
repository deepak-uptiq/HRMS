const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// Get all employees (HR view)
const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: {
          select: { id: true, name: true }
        },
        position: {
          select: { id: true, title: true }
        },
        user: {
          select: { 
            id: true, 
            username: true, 
            email: true, 
            role: true, 
            approvalStatus: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    logger.error('Get all employees error:', error);
    next(error);
  }
};

// Create new employee
const createEmployee = async (req, res, next) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      hireDate,
      salary,
      departmentId,
      positionId,
      userId
    } = req.body;

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName,
        lastName,
        email,
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        hireDate: new Date(hireDate),
        salary: parseFloat(salary),
        departmentId,
        positionId,
        userId
      },
      include: {
        department: {
          select: { id: true, name: true }
        },
        position: {
          select: { id: true, title: true }
        },
        user: {
          select: { 
            id: true, 
            username: true, 
            email: true, 
            role: true, 
            approvalStatus: true,
            isActive: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: employee,
      message: 'Employee created successfully'
    });
  } catch (error) {
    logger.error('Create employee error:', error);
    next(error);
  }
};

// Update employee
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      hireDate,
      salary,
      departmentId,
      positionId,
      isActive
    } = req.body;

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        employeeId,
        firstName,
        lastName,
        email,
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        salary: salary ? parseFloat(salary) : undefined,
        departmentId,
        positionId,
        isActive
      },
      include: {
        department: {
          select: { id: true, name: true }
        },
        position: {
          select: { id: true, title: true }
        },
        user: {
          select: { 
            id: true, 
            username: true, 
            email: true, 
            role: true, 
            approvalStatus: true,
            isActive: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: employee,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    logger.error('Update employee error:', error);
    next(error);
  }
};

// Delete employee
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.employee.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    logger.error('Delete employee error:', error);
    next(error);
  }
};

// Get employee by ID
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: {
          select: { id: true, name: true }
        },
        position: {
          select: { id: true, title: true }
        },
        user: {
          select: { 
            id: true, 
            username: true, 
            email: true, 
            role: true, 
            approvalStatus: true,
            isActive: true
          }
        }
      }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    logger.error('Get employee by ID error:', error);
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeById
};


