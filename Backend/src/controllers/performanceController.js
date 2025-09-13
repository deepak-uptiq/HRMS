const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// Get all performance reviews
const getAllPerformanceReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, employeeId, period, status, rating, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (employeeId) {
      where.employeeId = employeeId;
    }
    
    if (period) {
      where.period = { contains: period, mode: 'insensitive' };
    }
    
    if (status) {
      where.status = status;
    }
    
    if (rating) {
      where.rating = parseFloat(rating);
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

    const [reviews, total] = await Promise.all([
      prisma.performanceReview.findMany({
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
          },
          reviewer: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ]
      }),
      prisma.performanceReview.count({ where })
    ]);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: reviews
    });
  } catch (error) {
    logger.error('Error fetching performance reviews:', error);
    next(error);
  }
};

// Get performance review by ID
const getPerformanceReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.performanceReview.findUnique({
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
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!review) {
      return next(new AppError('Performance review not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: review
    });
  } catch (error) {
    logger.error('Error fetching performance review:', error);
    next(error);
  }
};

// Create new performance review
const createPerformanceReview = async (req, res, next) => {
  try {
    const { employeeId, period, goals, achievements, rating, comments } = req.body;
    const reviewerId = req.user.id;

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    // Check if review already exists for this employee and period
    const existingReview = await prisma.performanceReview.findFirst({
      where: {
        employeeId,
        period
      }
    });

    if (existingReview) {
      return next(new AppError('Performance review already exists for this employee and period', 400));
    }

    const review = await prisma.performanceReview.create({
      data: {
        employeeId,
        period,
        goals: goals || [],
        achievements: achievements || [],
        rating,
        comments,
        reviewedBy: reviewerId,
        status: 'PENDING'
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
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    logger.info(`New performance review created: ${review.id}`);

    res.status(201).json({
      status: 'success',
      message: 'Performance review created successfully',
      data: review
    });
  } catch (error) {
    logger.error('Error creating performance review:', error);
    next(error);
  }
};

// Update performance review
const updatePerformanceReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if review exists
    const existingReview = await prisma.performanceReview.findUnique({
      where: { id }
    });

    if (!existingReview) {
      return next(new AppError('Performance review not found', 404));
    }

    const review = await prisma.performanceReview.update({
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
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    logger.info(`Performance review updated: ${review.id}`);

    res.status(200).json({
      status: 'success',
      message: 'Performance review updated successfully',
      data: review
    });
  } catch (error) {
    logger.error('Error updating performance review:', error);
    next(error);
  }
};

// Delete performance review
const deletePerformanceReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if review exists
    const existingReview = await prisma.performanceReview.findUnique({
      where: { id }
    });

    if (!existingReview) {
      return next(new AppError('Performance review not found', 404));
    }

    // Prevent deletion of completed reviews
    if (existingReview.status === 'COMPLETED') {
      return next(new AppError('Cannot delete completed performance reviews', 400));
    }

    await prisma.performanceReview.delete({
      where: { id }
    });

    logger.info(`Performance review deleted: ${id}`);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Error deleting performance review:', error);
    next(error);
  }
};

// Submit self-review (Employee only)
const submitSelfReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { goals, achievements, selfComments } = req.body;
    const employeeId = req.user.employee?.id;

    if (!employeeId) {
      return next(new AppError('Employee record not found', 404));
    }

    // Check if review exists and belongs to the employee
    const review = await prisma.performanceReview.findFirst({
      where: {
        id,
        employeeId
      }
    });

    if (!review) {
      return next(new AppError('Performance review not found or access denied', 404));
    }

    // Update review with self-review data
    const updatedReview = await prisma.performanceReview.update({
      where: { id },
      data: {
        goals: goals || review.goals,
        achievements: achievements || review.achievements,
        comments: selfComments || review.comments,
        status: 'IN_PROGRESS'
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

    logger.info(`Self-review submitted: ${updatedReview.id}`);

    res.status(200).json({
      status: 'success',
      message: 'Self-review submitted successfully',
      data: updatedReview
    });
  } catch (error) {
    logger.error('Error submitting self-review:', error);
    next(error);
  }
};

// Complete performance review (HR/Admin only)
const completePerformanceReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comments } = req.body;
    const reviewerId = req.user.id;

    const review = await prisma.performanceReview.findUnique({
      where: { id }
    });

    if (!review) {
      return next(new AppError('Performance review not found', 404));
    }

    if (review.status === 'COMPLETED') {
      return next(new AppError('Performance review is already completed', 400));
    }

    const updatedReview = await prisma.performanceReview.update({
      where: { id },
      data: {
        rating: rating || review.rating,
        comments: comments || review.comments,
        status: 'COMPLETED',
        reviewedBy: reviewerId
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
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    logger.info(`Performance review completed: ${updatedReview.id}`);

    res.status(200).json({
      status: 'success',
      message: 'Performance review completed successfully',
      data: updatedReview
    });
  } catch (error) {
    logger.error('Error completing performance review:', error);
    next(error);
  }
};

// Get employee's performance reviews (for self-service)
const getEmployeePerformanceReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    const employeeId = req.user.employee?.id;

    if (!employeeId) {
      return next(new AppError('Employee record not found', 404));
    }

    const where = { employeeId };
    
    if (status) {
      where.status = status;
    }

    const [reviews, total] = await Promise.all([
      prisma.performanceReview.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ]
      }),
      prisma.performanceReview.count({ where })
    ]);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: reviews
    });
  } catch (error) {
    logger.error('Error fetching employee performance reviews:', error);
    next(error);
  }
};

module.exports = {
  getAllPerformanceReviews,
  getPerformanceReviewById,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
  submitSelfReview,
  completePerformanceReview,
  getEmployeePerformanceReviews
};
