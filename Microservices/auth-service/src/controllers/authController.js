const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { generateToken } = require('../middleware/auth');
const logger = require('../config/logger');

// Register new user
const register = async (req, res, next) => {
  try {
    const { username, email, password, requestedRole = 'EMPLOYEE', employeeId } = req.body;

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
        role: 'EMPLOYEE',
        approvalStatus: 'PENDING',
        requestedRole
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        requestedRole: true,
        approvalStatus: true,
        isActive: true,
        createdAt: true
      }
    });

    // If employeeId is provided, link user to employee
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

    logger.info(`New user registered: ${user.id}`);

    res.status(201).json({
      status: 'success',
      message: 'Signup submitted. Awaiting admin approval.',
      data: user
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        employee: {
          include: {
            department: true,
            position: true
          }
        }
      }
    });

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check approval status
    if (user.approvalStatus !== 'APPROVED') {
      return next(new AppError('Account pending approval by admin', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 401));
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${user.id}`);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const { password, ...userWithoutPassword } = req.user;

    res.status(200).json({
      status: 'success',
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const { username, email, phone, address } = req.body;
    const userId = req.user.id;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return next(new AppError('Email already taken', 400));
      }
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== req.user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return next(new AppError('Username already taken', 400));
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username || req.user.username,
        email: email || req.user.email
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

    // Update employee data if user is an employee
    if (req.user.employee) {
      await prisma.employee.update({
        where: { id: req.user.employee.id },
        data: {
          phone: phone || req.user.employee.phone,
          address: address || req.user.employee.address
        }
      });
    }

    logger.info(`User profile updated: ${userId}`);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return next(new AppError('Current password is incorrect', 400));
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    logger.info(`Password changed for user: ${userId}`);

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};

// Logout (client-side token removal)
const logout = async (req, res, next) => {
  try {
    logger.info(`User logged out: ${req.user.id}`);

    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
