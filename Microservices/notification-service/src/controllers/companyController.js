const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// Get company configuration
const getCompany = async (req, res, next) => {
  try {
    const company = await prisma.company.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!company) {
      return next(new AppError('Company configuration not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: company
    });
  } catch (error) {
    logger.error('Error fetching company:', error);
    next(error);
  }
};

// Create company configuration
const createCompany = async (req, res, next) => {
  try {
    const { name, address, phone, email, website, logo, settings } = req.body;

    // Check if company already exists
    const existingCompany = await prisma.company.findFirst();

    if (existingCompany) {
      return next(new AppError('Company configuration already exists. Use update instead.', 400));
    }

    // Set default settings if not provided
    const defaultSettings = {
      workingHours: { start: '09:00', end: '17:00' },
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      timezone: 'UTC',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      leavePolicy: {
        maxAnnualLeave: 20,
        maxSickLeave: 10,
        maxPersonalLeave: 5,
        advanceNoticeDays: 2
      },
      payrollSettings: {
        payFrequency: 'MONTHLY',
        payDay: 1,
        overtimeRate: 1.5,
        taxRate: 0.1
      },
      ...settings
    };

    const company = await prisma.company.create({
      data: {
        name,
        address,
        phone,
        email,
        website,
        logo,
        settings: defaultSettings
      }
    });

    logger.info(`Company configuration created: ${company.id}`);

    res.status(201).json({
      status: 'success',
      message: 'Company configuration created successfully',
      data: company
    });
  } catch (error) {
    logger.error('Error creating company:', error);
    next(error);
  }
};

// Update company configuration
const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      return next(new AppError('Company configuration not found', 404));
    }

    // Merge settings with existing settings
    if (updateData.settings) {
      updateData.settings = {
        ...existingCompany.settings,
        ...updateData.settings
      };
    }

    const company = await prisma.company.update({
      where: { id },
      data: updateData
    });

    logger.info(`Company configuration updated: ${company.id}`);

    res.status(200).json({
      status: 'success',
      message: 'Company configuration updated successfully',
      data: company
    });
  } catch (error) {
    logger.error('Error updating company:', error);
    next(error);
  }
};

// Get company statistics
const getCompanyStats = async (req, res, next) => {
  try {
    const [
      totalEmployees,
      totalDepartments,
      totalPositions,
      activeUsers,
      pendingLeaves,
      recentHires
    ] = await Promise.all([
      prisma.employee.count({
        where: { isActive: true }
      }),
      prisma.department.count(),
      prisma.position.count(),
      prisma.user.count({
        where: { isActive: true }
      }),
      prisma.leave.count({
        where: { status: 'PENDING' }
      }),
      prisma.employee.count({
        where: {
          hireDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
          }
        }
      })
    ]);

    const stats = {
      employees: {
        total: totalEmployees,
        recentHires
      },
      departments: totalDepartments,
      positions: totalPositions,
      users: {
        active: activeUsers
      },
      leaves: {
        pending: pendingLeaves
      }
    };

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching company stats:', error);
    next(error);
  }
};

module.exports = {
  getCompany,
  createCompany,
  updateCompany,
  getCompanyStats
};
