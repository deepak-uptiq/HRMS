const { z } = require('zod');

// Performance review validation schemas
const createPerformanceReviewSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    period: z.string().min(1, 'Review period is required'),
    goals: z.array(z.object({
      title: z.string().min(1, 'Goal title is required'),
      description: z.string().optional(),
      targetDate: z.string().date().optional(),
      weight: z.number().min(0).max(100).optional()
    })).optional(),
    achievements: z.array(z.object({
      title: z.string().min(1, 'Achievement title is required'),
      description: z.string().optional(),
      impact: z.string().optional()
    })).optional(),
    rating: z.number().min(1).max(5, 'Rating must be between 1 and 5').optional(),
    comments: z.string().optional()
  })
});

const updatePerformanceReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Review ID is required')
  }),
  body: z.object({
    period: z.string().min(1, 'Review period is required').optional(),
    goals: z.array(z.object({
      title: z.string().min(1, 'Goal title is required'),
      description: z.string().optional(),
      targetDate: z.string().date().optional(),
      weight: z.number().min(0).max(100).optional()
    })).optional(),
    achievements: z.array(z.object({
      title: z.string().min(1, 'Achievement title is required'),
      description: z.string().optional(),
      impact: z.string().optional()
    })).optional(),
    rating: z.number().min(1).max(5, 'Rating must be between 1 and 5').optional(),
    comments: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
  })
});

const getPerformanceReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Review ID is required')
  })
});

const deletePerformanceReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Review ID is required')
  })
});

const getPerformanceReviewsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    employeeId: z.string().optional(),
    period: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    rating: z.string().optional(),
    search: z.string().optional()
  })
});

const submitSelfReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Review ID is required')
  }),
  body: z.object({
    goals: z.array(z.object({
      title: z.string().min(1, 'Goal title is required'),
      description: z.string().optional(),
      targetDate: z.string().date().optional(),
      weight: z.number().min(0).max(100).optional(),
      selfRating: z.number().min(1).max(5).optional()
    })).optional(),
    achievements: z.array(z.object({
      title: z.string().min(1, 'Achievement title is required'),
      description: z.string().optional(),
      impact: z.string().optional()
    })).optional(),
    selfComments: z.string().optional()
  })
});

module.exports = {
  createPerformanceReviewSchema,
  updatePerformanceReviewSchema,
  getPerformanceReviewSchema,
  deletePerformanceReviewSchema,
  getPerformanceReviewsSchema,
  submitSelfReviewSchema
};
