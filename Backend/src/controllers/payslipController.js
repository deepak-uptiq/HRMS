const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// Get all payslips
const getAllPayslips = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, employeeId, month, year, status, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (employeeId) {
      where.employeeId = employeeId;
    }
    
    if (month) {
      where.month = parseInt(month);
    }
    
    if (year) {
      where.year = parseInt(year);
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.employee = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { employeeId: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const [payslips, total] = await Promise.all([
      prisma.payslip.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
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
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
          { generatedAt: 'desc' }
        ]
      }),
      prisma.payslip.count({ where })
    ]);

    res.status(200).json({
      status: 'success',
      results: payslips.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: payslips
    });
  } catch (error) {
    logger.error('Error fetching payslips:', error);
    next(error);
  }
};

// Get payslip by ID
const getPayslipById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
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

    if (!payslip) {
      return next(new AppError('Payslip not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: payslip
    });
  } catch (error) {
    logger.error('Error fetching payslip:', error);
    next(error);
  }
};

// Create new payslip
const createPayslip = async (req, res, next) => {
  try {
    const { employeeId, month, year, basicSalary, allowances = 0, deductions = 0, overtimeHours = 0, overtimeRate = 0 } = req.body;

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    // Check if payslip already exists for this employee and period
    const existingPayslip = await prisma.payslip.findFirst({
      where: {
        employeeId,
        month,
        year
      }
    });

    if (existingPayslip) {
      return next(new AppError('Payslip already exists for this employee and period', 400));
    }

    // Calculate overtime pay
    const overtimePay = overtimeHours * overtimeRate;
    
    // Calculate net salary
    const grossSalary = basicSalary + allowances + overtimePay;
    const netSalary = grossSalary - deductions;

    const payslip = await prisma.payslip.create({
      data: {
        employeeId,
        month,
        year,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        status: 'GENERATED'
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

    logger.info(`New payslip created: ${payslip.id}`);

    res.status(201).json({
      status: 'success',
      message: 'Payslip created successfully',
      data: payslip
    });
  } catch (error) {
    logger.error('Error creating payslip:', error);
    next(error);
  }
};

// Update payslip
const updatePayslip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if payslip exists
    const existingPayslip = await prisma.payslip.findUnique({
      where: { id }
    });

    if (!existingPayslip) {
      return next(new AppError('Payslip not found', 404));
    }

    // Recalculate net salary if financial data is being updated
    if (updateData.basicSalary || updateData.allowances || updateData.deductions || updateData.overtimeHours || updateData.overtimeRate) {
      const basicSalary = updateData.basicSalary || existingPayslip.basicSalary;
      const allowances = updateData.allowances !== undefined ? updateData.allowances : existingPayslip.allowances;
      const deductions = updateData.deductions !== undefined ? updateData.deductions : existingPayslip.deductions;
      const overtimeHours = updateData.overtimeHours || 0;
      const overtimeRate = updateData.overtimeRate || 0;
      
      const overtimePay = overtimeHours * overtimeRate;
      const grossSalary = basicSalary + allowances + overtimePay;
      const netSalary = grossSalary - deductions;
      
      updateData.netSalary = netSalary;
    }

    const payslip = await prisma.payslip.update({
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

    logger.info(`Payslip updated: ${payslip.id}`);

    res.status(200).json({
      status: 'success',
      message: 'Payslip updated successfully',
      data: payslip
    });
  } catch (error) {
    logger.error('Error updating payslip:', error);
    next(error);
  }
};

// Delete payslip
const deletePayslip = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if payslip exists
    const existingPayslip = await prisma.payslip.findUnique({
      where: { id }
    });

    if (!existingPayslip) {
      return next(new AppError('Payslip not found', 404));
    }

    // Prevent deletion of paid payslips
    if (existingPayslip.status === 'PAID') {
      return next(new AppError('Cannot delete paid payslips', 400));
    }

    await prisma.payslip.delete({
      where: { id }
    });

    logger.info(`Payslip deleted: ${id}`);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Error deleting payslip:', error);
    next(error);
  }
};

// Generate payslips for multiple employees
const generatePayslips = async (req, res, next) => {
  try {
    const { month, year, employeeIds } = req.body;

    // Get employees to generate payslips for
    let employees;
    if (employeeIds && employeeIds.length > 0) {
      employees = await prisma.employee.findMany({
        where: {
          id: { in: employeeIds },
          isActive: true
        }
      });
    } else {
      employees = await prisma.employee.findMany({
        where: { isActive: true }
      });
    }

    if (employees.length === 0) {
      return next(new AppError('No active employees found', 404));
    }

    const generatedPayslips = [];
    const errors = [];

    for (const employee of employees) {
      try {
        // Check if payslip already exists
        const existingPayslip = await prisma.payslip.findFirst({
          where: {
            employeeId: employee.id,
            month,
            year
          }
        });

        if (existingPayslip) {
          errors.push(`Payslip already exists for ${employee.firstName} ${employee.lastName}`);
          continue;
        }

        // Create payslip
        const payslip = await prisma.payslip.create({
          data: {
            employeeId: employee.id,
            month,
            year,
            basicSalary: employee.salary || 0,
            allowances: 0,
            deductions: 0,
            netSalary: employee.salary || 0,
            status: 'GENERATED'
          }
        });

        generatedPayslips.push(payslip);
      } catch (error) {
        errors.push(`Error generating payslip for ${employee.firstName} ${employee.lastName}: ${error.message}`);
      }
    }

    logger.info(`Generated ${generatedPayslips.length} payslips for ${month}/${year}`);

    res.status(201).json({
      status: 'success',
      message: `Generated ${generatedPayslips.length} payslips`,
      data: {
        generated: generatedPayslips.length,
        total: employees.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    logger.error('Error generating payslips:', error);
    next(error);
  }
};

// Mark payslip as paid
const markPayslipAsPaid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payslip = await prisma.payslip.findUnique({
      where: { id }
    });

    if (!payslip) {
      return next(new AppError('Payslip not found', 404));
    }

    if (payslip.status === 'PAID') {
      return next(new AppError('Payslip is already marked as paid', 400));
    }

    const updatedPayslip = await prisma.payslip.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date()
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

    logger.info(`Payslip marked as paid: ${updatedPayslip.id}`);

    res.status(200).json({
      status: 'success',
      message: 'Payslip marked as paid',
      data: updatedPayslip
    });
  } catch (error) {
    logger.error('Error marking payslip as paid:', error);
    next(error);
  }
};

// Get employee's payslips (for self-service)
const getEmployeePayslips = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, year } = req.query;
    const skip = (page - 1) * limit;
    const employeeId = req.user.employee?.id;

    if (!employeeId) {
      return next(new AppError('Employee record not found', 404));
    }

    const where = { employeeId };
    
    if (year) {
      where.year = parseInt(year);
    }

    const [payslips, total] = await Promise.all([
      prisma.payslip.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: [
          { year: 'desc' },
          { month: 'desc' }
        ]
      }),
      prisma.payslip.count({ where })
    ]);

    res.status(200).json({
      status: 'success',
      results: payslips.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: payslips
    });
  } catch (error) {
    logger.error('Error fetching employee payslips:', error);
    next(error);
  }
};

module.exports = {
  getAllPayslips,
  getPayslipById,
  createPayslip,
  updatePayslip,
  deletePayslip,
  generatePayslips,
  markPayslipAsPaid,
  getEmployeePayslips
};
