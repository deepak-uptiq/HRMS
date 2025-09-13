const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { AppError } = require('./errorHandler');
const logger = require('../config/logger');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      return next(new AppError('Invalid token. User not found.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Account is deactivated.', 401));
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired.', 401));
    }
    logger.error('Authentication error:', error);
    next(new AppError('Authentication failed.', 401));
  }
};

// Authorization middleware - check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
};

// Check if user can access employee data
const authorizeEmployeeAccess = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }

  const { role } = req.user;
  const employeeId = req.params.id || req.params.employeeId;

  // Admin and HR can access all employee data
  if (role === 'ADMIN' || role === 'HR') {
    return next();
  }

  // Employee can only access their own data
  if (role === 'EMPLOYEE') {
    if (req.user.employee && req.user.employee.id === employeeId) {
      return next();
    }
    return next(new AppError('Access denied. You can only access your own data.', 403));
  }

  next(new AppError('Access denied.', 403));
};

// Check if user can access their own data
const authorizeSelfAccess = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }

  const userId = req.params.id || req.params.userId;
  
  if (req.user.id !== userId) {
    return next(new AppError('Access denied. You can only access your own data.', 403));
  }

  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  authorize,
  authorizeEmployeeAccess,
  authorizeSelfAccess
};
