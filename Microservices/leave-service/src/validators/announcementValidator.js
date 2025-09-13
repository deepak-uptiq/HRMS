const { z } = require('zod');

// Announcement validation schemas
const createAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    type: z.enum(['GENERAL', 'URGENT', 'POLICY', 'EVENT']).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    startDate: z.string().datetime().or(z.string().date()).optional(),
    endDate: z.string().datetime().or(z.string().date()).optional()
  })
});

const updateAnnouncementSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Announcement ID is required')
  }),
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').optional(),
    content: z.string().min(10, 'Content must be at least 10 characters').optional(),
    type: z.enum(['GENERAL', 'URGENT', 'POLICY', 'EVENT']).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    isActive: z.boolean().optional(),
    startDate: z.string().datetime().or(z.string().date()).optional(),
    endDate: z.string().datetime().or(z.string().date()).optional()
  })
});

const getAnnouncementSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Announcement ID is required')
  })
});

const deleteAnnouncementSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Announcement ID is required')
  })
});

const getAnnouncementsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.enum(['GENERAL', 'URGENT', 'POLICY', 'EVENT']).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    isActive: z.string().optional(),
    search: z.string().optional()
  })
});

module.exports = {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  getAnnouncementSchema,
  deleteAnnouncementSchema,
  getAnnouncementsSchema
};
