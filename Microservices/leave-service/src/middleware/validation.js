const { z } = require('zod');
const { AppError } = require('./errorHandler');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate the request against the schema
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      // Replace req properties with validated data
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return next(new AppError(`Validation Error: ${errorMessages.map(e => e.message).join(', ')}`, 400));
      }
      next(error);
    }
  };
};

module.exports = { validate };
