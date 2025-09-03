import Joi from 'joi';

// Initiate call validation schema
export const initiateCallSchema = Joi.object({
  receiver_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Invalid receiver ID format',
      'any.required': 'Receiver ID is required'
    }),
  
  call_type: Joi.string()
    .valid('voice', 'video')
    .required()
    .messages({
      'any.only': 'Call type must be either voice or video',
      'any.required': 'Call type is required'
    })
});

// End call validation schema
export const endCallSchema = Joi.object({
  duration: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.integer': 'Duration must be an integer',
      'number.min': 'Duration cannot be negative'
    })
});

// Call ID parameter validation schema
export const callIdParamSchema = Joi.object({
  callId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Invalid call ID format',
      'any.required': 'Call ID is required'
    })
});