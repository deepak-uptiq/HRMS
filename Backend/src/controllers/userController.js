const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// List pending users (Admin only)
const getPendingUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { approvalStatus: 'PENDING' },
      select: {
        id: true,
        username: true,
        email: true,
        requestedRole: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ status: 'success', results: users.length, data: users });
  } catch (error) {
    logger.error('Error fetching pending users:', error);
    next(error);
  }
};

// Approve user (Admin only)
const approveUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return next(new AppError('User not found', 404));

    if (user.approvalStatus === 'APPROVED') {
      return next(new AppError('User already approved', 400));
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        role: user.requestedRole || user.role,
        approvedBy: req.user.id,
        approvedAt: new Date(),
        rejectionReason: null
      },
      select: {
        id: true, username: true, email: true, role: true, approvalStatus: true, approvedAt: true
      }
    });

    res.status(200).json({ status: 'success', message: 'User approved', data: updated });
  } catch (error) {
    logger.error('Error approving user:', error);
    next(error);
  }
};

// Reject user (Admin only)
const rejectUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return next(new AppError('User not found', 404));

    const updated = await prisma.user.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        rejectionReason: reason || 'No reason provided'
      },
      select: {
        id: true, username: true, email: true, role: true, approvalStatus: true, rejectionReason: true
      }
    });

    res.status(200).json({ status: 'success', message: 'User rejected', data: updated });
  } catch (error) {
    logger.error('Error rejecting user:', error);
    next(error);
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
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
      }),
      prisma.user.count({ where })
    ]);

    res.status(200).json({
      status: 'success',
      results: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    next(error);
  }
};

// Get user by ID (Admin only)
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            department: {
              select: {
                id: true,
                name: true
              }
            },
            position: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    next(error);
  }
};

// Create new user (Admin only)
const createUser = async (req, res, next) => {
  try {
    const { username, email, password, role, employeeId } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return next(new AppError('User with this email or username already exists', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    // Link to employee if employeeId provided
    if (employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId }
      });

      if (employee) {
        await prisma.employee.update({
          where: { id: employeeId },
          data: { userId: user.id }
        });
      }
    }

    logger.info(`New user created by admin: ${user.id}`);

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    next(error);
  }
};

// Update user (Admin only)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, role, isActive, employeeId } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return next(new AppError('User not found', 404));
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return next(new AppError('Email already taken', 400));
      }
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username }
      });

      if (usernameExists) {
        return next(new AppError('Username already taken', 400));
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        username: username || existingUser.username,
        email: email || existingUser.email,
        role: role || existingUser.role,
        isActive: isActive !== undefined ? isActive : existingUser.isActive
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Update employee link if provided
    if (employeeId !== undefined) {
      if (employeeId) {
        // Link to new employee
        await prisma.employee.updateMany({
          where: { userId: id },
          data: { userId: null }
        });
        
        await prisma.employee.update({
          where: { id: employeeId },
          data: { userId: id }
        });
      } else {
        // Unlink from current employee
        await prisma.employee.updateMany({
          where: { userId: id },
          data: { userId: null }
        });
      }
    }

    logger.info(`User updated by admin: ${user.id}`);

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    next(error);
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return next(new AppError('User not found', 404));
    }

    // Prevent deleting own account
    if (id === req.user.id) {
      return next(new AppError('Cannot delete your own account', 400));
    }

    // Unlink from employee first
    await prisma.employee.updateMany({
      where: { userId: id },
      data: { userId: null }
    });

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    logger.info(`User deleted by admin: ${id}`);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    next(error);
  }
};

// Get audit logs (Admin only)
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, userId, action, entity } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }
    
    if (entity) {
      where.entity = { contains: entity, mode: 'insensitive' };
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    res.status(200).json({
      status: 'success',
      results: auditLogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: auditLogs
    });
  } catch (error) {
    logger.error('Error fetching audit logs:', error);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAuditLogs,
  getPendingUsers,
  approveUser,
  rejectUser
};
