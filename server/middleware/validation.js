import Joi from 'joi';

// Generic validation middleware factory
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: 'Validation Error',
        details: errorDetails
      });
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Specific validation middleware functions
export const validateBody = (schema) => validate(schema, 'body');
export const validateParams = (schema) => validate(schema, 'params');
export const validateQuery = (schema) => validate(schema, 'query');

// Combined validation middleware for multiple properties
export const validateRequest = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each specified property
    Object.keys(schemas).forEach(property => {
      const schema = schemas[property];
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const propertyErrors = error.details.map(detail => ({
          property,
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));
        errors.push(...propertyErrors);
      } else {
        // Replace with validated data
        req[property] = value;
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors
      });
    }

    next();
  };
};

// Error handling middleware for validation errors
export const handleValidationError = (err, req, res, next) => {
  if (err.isJoi) {
    const errorDetails = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));

    return res.status(400).json({
      error: 'Validation Error',
      details: errorDetails
    });
  }
  
  next(err);
};