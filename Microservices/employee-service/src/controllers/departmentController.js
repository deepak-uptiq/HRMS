const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// Get all departments
const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
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
        name: 'asc'
      }
    });

    res.status(200).json({
      status: 'success',
      results: departments.length,
      data: departments
    });
  } catch (error) {
    logger.error('Error fetching departments:', error);
    next(error);
  }
};

// Get department by ID
const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
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
            position: {
              select: {
                title: true
              }
            }
          }
        }
      }
    });

    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: department
    });
  } catch (error) {
    logger.error('Error fetching department:', error);
    next(error);
  }
};

// Create new department
const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Check if department with name already exists
    const existingDepartment = await prisma.department.findUnique({
      where: { name }
    });

    if (existingDepartment) {
      return next(new AppError('Department with this name already exists', 400));
    }

    const department = await prisma.department.create({
      data: {
        name,
        description
      }
    });

    logger.info(`New department created: ${department.id}`);

    res.status(201).json({
      status: 'success',
      data: department
    });
  } catch (error) {
    logger.error('Error creating department:', error);
    next(error);
  }
};

// Update department
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id }
    });

    if (!existingDepartment) {
      return next(new AppError('Department not found', 404));
    }

    // If name is being updated, check for duplicates
    if (name && name !== existingDepartment.name) {
      const nameExists = await prisma.department.findUnique({
        where: { name }
      });

      if (nameExists) {
        return next(new AppError('Department with this name already exists', 400));
      }
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        name: name || existingDepartment.name,
        description: description !== undefined ? description : existingDepartment.description
      }
    });

    logger.info(`Department updated: ${department.id}`);

    res.status(200).json({
      status: 'success',
      data: department
    });
  } catch (error) {
    logger.error('Error updating department:', error);
    next(error);
  }
};

// Delete department
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id },
      include: {
        employees: true
      }
    });

    if (!existingDepartment) {
      return next(new AppError('Department not found', 404));
    }

    // Check if department has employees
    if (existingDepartment.employees.length > 0) {
      return next(new AppError('Cannot delete department with existing employees', 400));
    }

    await prisma.department.delete({
      where: { id }
    });

    logger.info(`Department deleted: ${id}`);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Error deleting department:', error);
    next(error);
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
