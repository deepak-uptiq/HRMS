const { z } = require('zod');

// Position validation schemas
const createPositionSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Position title must be at least 2 characters'),
    description: z.string().optional(),
    level: z.number().int().min(1, 'Level must be at least 1').optional()
  })
});

const updatePositionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Position ID is required')
  }),
  body: z.object({
    title: z.string().min(2, 'Position title must be at least 2 characters').optional(),
    description: z.string().optional(),
    level: z.number().int().min(1, 'Level must be at least 1').optional()
  })
});

const getPositionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Position ID is required')
  })
});

const deletePositionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Position ID is required')
  })
});

module.exports = {
  createPositionSchema,
  updatePositionSchema,
  getPositionSchema,
  deletePositionSchema
};
